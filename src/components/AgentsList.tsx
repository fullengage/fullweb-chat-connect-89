
import { AgentCard } from "./AgentCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentWithStats } from "@/hooks/useAgents";

interface AgentsListProps {
  searchTerm: string;
  roleFilter: string;
  agents: AgentWithStats[];
  onAgentClick: (agent: AgentWithStats) => void;
  onAgentEdit?: (agent: AgentWithStats) => void;
  onSetPassword?: (agent: AgentWithStats) => void;
  isLoading: boolean;
}

export const AgentsList = ({ 
  searchTerm, 
  roleFilter, 
  agents, 
  onAgentClick, 
  onAgentEdit,
  onSetPassword,
  isLoading 
}: AgentsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.phone && agent.phone.includes(searchTerm));
    const matchesRole = roleFilter === "all" || agent.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (filteredAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          👥
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agente encontrado</h3>
        <p className="text-gray-600">
          {searchTerm || roleFilter !== "all" 
            ? "Tente ajustar os filtros de busca." 
            : "Comece criando seu primeiro agente."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <AgentCard 
          key={agent.id} 
          agent={agent} 
          onClick={() => onAgentClick(agent)}
          onEdit={() => onAgentEdit?.(agent)}
          onSetPassword={() => onSetPassword?.(agent)}
        />
      ))}
    </div>
  );
};
