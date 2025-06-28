
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Phone, Crown, Users } from "lucide-react";
import { Team } from "@/hooks/useTeams";

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export function TeamMembersDialog({ open, onOpenChange, team }: TeamMembersDialogProps) {
  if (!team) return null;

  const allMembers = team.members || [];
  const leader = team.leader;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Membros da Equipe: {team.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {allMembers.length}
              </div>
              <div className="text-sm text-blue-600">Total de Membros</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leader ? 1 : 0}
              </div>
              <div className="text-sm text-green-600">Líder</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {team.performance_score}%
              </div>
              <div className="text-sm text-purple-600">Performance</div>
            </div>
          </div>

          {/* Líder da Equipe */}
          {leader && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Líder da Equipe</span>
              </h3>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={leader.avatar_url} />
                    <AvatarFallback>
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{leader.name}</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Líder</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{leader.email}</p>
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
            </div>
          )}

          {/* Membros da Equipe */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Membros ({allMembers.length})
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {allMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum membro adicionado ainda</p>
                    <p className="text-sm">Use o botão "Editar equipe" para adicionar membros</p>
                  </div>
                ) : (
                  allMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
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
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
