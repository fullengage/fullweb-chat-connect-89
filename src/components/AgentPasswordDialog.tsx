
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentPasswordDialogProps {
  agent: AgentWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgentPasswordDialog = ({ agent, open, onOpenChange }: AgentPasswordDialogProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
    setConfirmPassword(password);
    toast({
      title: "Senha gerada",
      description: "Uma senha segura foi gerada automaticamente.",
    });
  };

  const handleSubmit = async () => {
    if (!agent) return;

    if (!password.trim()) {
      toast({
        title: "Erro",
        description: "A senha é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Buscar usuário autenticado pelo email
      const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) throw searchError;

      const existingUser = users.users.find(user => user.email === agent.email);

      if (existingUser) {
        // Atualizar senha do usuário existente
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );

        if (updateError) throw updateError;

        toast({
          title: "Senha atualizada",
          description: `A senha do agente ${agent.name} foi atualizada com sucesso.`,
        });
      } else {
        // Criar novo usuário autenticado
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: agent.email,
          password,
          email_confirm: true,
          user_metadata: {
            name: agent.name,
            role: agent.role
          }
        });

        if (authError) throw authError;

        // Criar registro na tabela users se não existir
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            auth_user_id: authData.user.id,
            account_id: agent.account_id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            role: agent.role,
            isactive: true
          });

        if (userError) {
          console.error('Error creating user record:', userError);
        }

        toast({
          title: "Conta criada",
          description: `Conta de login criada para ${agent.name} com sucesso.`,
        });
      }

      setPassword("");
      setConfirmPassword("");
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: "Erro ao definir senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Definir Senha - {agent.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> {agent.email}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Defina uma senha para que este agente possa fazer login no sistema.
            </p>
          </div>

          <div>
            <Label htmlFor="password">Nova Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite uma senha segura"
                className="pr-20"
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
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">As senhas não coincidem</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Definindo..." : "Definir Senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
