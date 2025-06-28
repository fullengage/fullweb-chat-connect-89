
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  accountName: string;
  onSuccess: () => void;
}

export const CreateAdminUserDialog = ({ 
  open, 
  onOpenChange, 
  accountId, 
  accountName,
  onSuccess 
}: CreateAdminUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast({
      title: "Senha gerada",
      description: "Uma senha segura foi gerada automaticamente.",
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log('Creating admin user for account:', accountId);
      
      // 1. Primeiro, criar registro na tabela users com service role
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          account_id: accountId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'admin',
          isactive: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
        throw new Error(`Erro ao criar registro do usuário: ${userError.message}`);
      }

      console.log('User record created:', newUser);

      // 2. Criar o usuário autenticado no Supabase usando service role
      // Nota: Isso requer service role key - vamos usar uma edge function
      const { data: authData, error: authError } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: formData.email,
          password: formData.password,
          userData: {
            name: formData.name,
            role: 'admin',
            userId: newUser.id
          }
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        // Se falhou ao criar auth user, remover o registro criado
        await supabase.from('users').delete().eq('id', newUser.id);
        throw new Error(`Erro ao criar conta de autenticação: ${authError.message}`);
      }

      // 3. Atualizar o registro do usuário com o auth_user_id
      if (authData?.user?.id) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ auth_user_id: authData.user.id })
          .eq('id', newUser.id);

        if (updateError) {
          console.error('Error updating user with auth_user_id:', updateError);
        }
      }

      toast({
        title: "Usuário admin criado com sucesso",
        description: `O usuário admin foi criado para ${accountName} e pode fazer login no sistema.`,
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", password: "" });
      setErrors({});
      onSuccess();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Erro ao criar usuário admin",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Usuário Admin</DialogTitle>
          <p className="text-sm text-gray-600">
            Cadastre um administrador para <strong>{accountName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : "A"}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="admin-name">Nome Completo *</Label>
            <Input
              id="admin-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="admin-email">Email *</Label>
            <Input
              id="admin-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="admin-password">Senha *</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? "border-red-500 pr-20" : "pr-20"}
                placeholder="Digite uma senha segura"
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={generatePassword}
                >
                  Gerar
                </Button>
              </div>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres. Use o botão "Gerar" para criar uma senha segura.</p>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="admin-phone">Telefone</Label>
            <Input
              id="admin-phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Criar Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
