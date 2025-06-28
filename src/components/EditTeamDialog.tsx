
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { Team } from "@/hooks/useTeams";

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  onSave: (teamData: any) => void;
}

export function EditTeamDialog({ open, onOpenChange, team, onSave }: EditTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    description: "",
    leader_id: "",
    member_ids: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  // Buscar usuários da conta atual
  const { data: users = [] } = useUsers(1); // Usar account_id do contexto

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        department: team.department,
        description: team.description || "",
        leader_id: team.leader_id || "",
        member_ids: team.member_ids || []
      });
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setIsLoading(true);

    try {
      await onSave({
        id: team.id,
        ...formData
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberToggle = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      member_ids: checked 
        ? [...prev.member_ids, userId]
        : prev.member_ids.filter(id => id !== userId)
    }));
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editar Equipe</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Equipe</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Departamento</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="leader">Líder da Equipe</Label>
            <Select 
              value={formData.leader_id} 
              onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum líder</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o objetivo e responsabilidades da equipe..."
              rows={3}
            />
          </div>

          <div>
            <Label>Membros da Equipe</Label>
            <ScrollArea className="h-48 border rounded-md p-4">
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`member-${user.id}`}
                      checked={formData.member_ids.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleMemberToggle(user.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`member-${user.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {user.name}
                      </label>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-gray-500 mt-2">
              {formData.member_ids.length} membro(s) selecionado(s)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
