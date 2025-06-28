
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MoreHorizontal, Mail, Phone, Edit, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditTeamDialog } from "@/components/EditTeamDialog";
import { TeamMembersDialog } from "@/components/TeamMembersDialog";
import { Team } from "@/hooks/useTeams";

interface TeamsListProps {
  searchTerm: string;
  departmentFilter: string;
  teams: Team[];
  onUpdateTeam: (teamData: any) => void;
  onDeleteTeam: (teamId: string) => void;
  isLoading: boolean;
}

export function TeamsList({ 
  searchTerm, 
  departmentFilter, 
  teams,
  onUpdateTeam,
  onDeleteTeam,
  isLoading 
}: TeamsListProps) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.leader?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || team.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getDepartmentLabel = (department: string) => {
    const labels: { [key: string]: string } = {
      vendas: "Vendas",
      suporte: "Suporte",
      marketing: "Marketing",
      desenvolvimento: "Desenvolvimento",
      "recursos-humanos": "Recursos Humanos",
      financeiro: "Financeiro"
    };
    return labels[department] || department;
  };

  const handleDeleteTeam = (team: Team) => {
    setDeletingTeam(team);
  };

  const confirmDelete = () => {
    if (deletingTeam) {
      onDeleteTeam(deletingTeam.id);
      setDeletingTeam(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredTeams.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Users className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma equipe encontrada
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou criar uma nova equipe.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {team.name}
                        </h3>
                        <Badge className={getStatusColor(team.is_active)}>
                          {team.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        {getDepartmentLabel(team.department)}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTeam(team)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar equipe
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewingTeam(team)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver membros
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Desativar equipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{team.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {team.member_ids?.length || 0} membros
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Performance: </span>
                        <span className={`font-medium ${getPerformanceColor(team.performance_score)}`}>
                          {team.performance_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {team.leader && (
                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={team.leader.avatar_url} />
                          <AvatarFallback>
                            {team.leader.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {team.leader.name}
                          </p>
                          <p className="text-xs text-gray-500">Líder da equipe</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditTeamDialog
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
        team={editingTeam}
        onSave={onUpdateTeam}
      />

      <TeamMembersDialog
        open={!!viewingTeam}
        onOpenChange={(open) => !open && setViewingTeam(null)}
        team={viewingTeam}
      />

      <AlertDialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a equipe "{deletingTeam?.name}"? 
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
