
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search } from "lucide-react";
import { TeamStats } from "@/components/TeamStats";
import { TeamsList } from "@/components/TeamsList";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Teams = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user: authUser } = useAuth();

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      setCurrentUser(userData);
    };

    fetchCurrentUser();
  }, [authUser]);

  const accountId = currentUser?.account_id || 1;

  // Hooks para gerenciar equipes
  const { data: teams = [], isLoading, error } = useTeams(accountId);
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const handleCreateTeam = async (teamData: any) => {
    try {
      await createTeamMutation.mutateAsync({
        ...teamData,
        account_id: accountId
      });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleUpdateTeam = async (teamData: any) => {
    try {
      await updateTeamMutation.mutateAsync(teamData);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar equipes</h2>
                <p className="text-gray-600">Não foi possível carregar os dados das equipes.</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Equipes</h1>
                    <p className="text-gray-600">Gerencie as equipes da sua organização</p>
                  </div>
                </div>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Equipe
              </Button>
            </div>

            {/* Stats Cards */}
            <TeamStats teams={teams} />

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar equipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Teams List */}
            <TeamsList 
              searchTerm={searchTerm} 
              departmentFilter={departmentFilter}
              teams={teams}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
              isLoading={isLoading}
            />

            {/* Create Team Dialog */}
            <CreateTeamDialog 
              open={isCreateDialogOpen} 
              onOpenChange={setIsCreateDialogOpen}
              onSave={handleCreateTeam}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Teams;
