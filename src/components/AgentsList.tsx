import { AgentCard } from "./AgentCard";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  teams?: string[];
  attendances: number;
  avgResponseTime: string;
  resolutionRate: number;
  rating: number;
  isOnline: boolean;
  conversationsToday: number;
  lastActivity?: string;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    initials: "MS",
    name: "Maria Silva",
    email: "maria.silva@empresa.com",
    phone: "(11) 99999-1111",
    role: "agent",
    status: "Online",
    teams: ["Vendas"],
    attendances: 8,
    avgResponseTime: "2m 30s",
    resolutionRate: 95,
    rating: 4.8,
    isOnline: true,
    conversationsToday: 8,
    lastActivity: "Ativo agora"
  },
  {
    id: "2",
    initials: "JS",
    name: "João Santos", 
    email: "joao.santos@empresa.com",
    phone: "(11) 99999-2222",
    role: "supervisor",
    status: "Ocupado",
    teams: ["Suporte", "Técnico"],
    attendances: 12,
    avgResponseTime: "1m 45s",
    resolutionRate: 98,
    rating: 4.9,
    isOnline: true,
    conversationsToday: 12,
    lastActivity: "Ativo há 5 min"
  },
  {
    id: "3",
    initials: "AC",
    name: "Ana Costa",
    email: "ana.costa@empresa.com",
    phone: "(21) 98888-3333",
    role: "supervisor",
    status: "Online",
    teams: ["Vendas", "Suporte"],
    attendances: 15,
    avgResponseTime: "1m 15s",
    resolutionRate: 96,
    rating: 4.7,
    isOnline: true,
    conversationsToday: 15,
    lastActivity: "Ativo agora"
  },
  {
    id: "4",
    initials: "A",
    name: "Administrador",
    email: "admin@empresa.com",
    phone: "(11) 99999-0000",
    role: "administrator",
    status: "Online",
    teams: ["Vendas", "Suporte", "Técnico", "Financeiro"],
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: true,
    conversationsToday: 0,
    lastActivity: "Ativo agora"
  },
  {
    id: "5",
    initials: "PC",
    name: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    phone: "(31) 97777-4444",
    role: "agent",
    status: "Offline",
    teams: ["Técnico"],
    attendances: 6,
    avgResponseTime: "3m 20s",
    resolutionRate: 89,
    rating: 4.3,
    isOnline: false,
    conversationsToday: 6,
    lastActivity: "Há 2 horas"
  },
  {
    id: "6",
    initials: "LC",
    name: "Lucia Cardoso",
    email: "lucia.cardoso@empresa.com",
    phone: "(41) 96666-5555",
    role: "agent",
    status: "Ausente",
    teams: ["Financeiro"],
    attendances: 4,
    avgResponseTime: "4m 10s",
    resolutionRate: 85,
    rating: 4.1,
    isOnline: false,
    conversationsToday: 4,
    lastActivity: "Há 1 hora"
  },
  {
    id: "7",
    initials: "RF",
    name: "Roberto Ferreira",
    email: "roberto.ferreira@empresa.com",
    phone: "(51) 95555-6666",
    role: "agent",
    status: "Online",
    teams: ["Suporte"],
    attendances: 10,
    avgResponseTime: "2m 45s",
    resolutionRate: 92,
    rating: 4.6,
    isOnline: true,
    conversationsToday: 10,
    lastActivity: "Ativo agora"
  },
  {
    id: "8",
    initials: "CS",
    name: "Carla Souza",
    email: "carla.souza@empresa.com",
    phone: "(61) 94444-7777",
    role: "supervisor",
    status: "Online",
    teams: ["Vendas"],
    attendances: 18,
    avgResponseTime: "1m 30s",
    resolutionRate: 97,
    rating: 4.8,
    isOnline: true,
    conversationsToday: 18,
    lastActivity: "Ativo agora"
  },
  {
    id: "9",
    initials: "TA",
    name: "Thiago Almeida",
    email: "thiago.almeida@empresa.com",
    phone: "(71) 93333-8888",
    role: "agent",
    status: "Ocupado",
    teams: ["Técnico", "Suporte"],
    attendances: 7,
    avgResponseTime: "3m 5s",
    resolutionRate: 88,
    rating: 4.4,
    isOnline: true,
    conversationsToday: 7,
    lastActivity: "Ativo há 10 min"
  },
  {
    id: "10",
    initials: "BL",
    name: "Beatriz Lima",
    email: "beatriz.lima@empresa.com",
    phone: "(81) 92222-9999",
    role: "agent",
    status: "Online",
    teams: ["Financeiro", "Vendas"],
    attendances: 11,
    avgResponseTime: "2m 15s",
    resolutionRate: 94,
    rating: 4.7,
    isOnline: true,
    conversationsToday: 11,
    lastActivity: "Ativo agora"
  }
];

interface AgentsListProps {
  searchTerm: string;
  roleFilter: string;
  agents?: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

export const AgentsList = ({ searchTerm, roleFilter, agents = mockAgents, onAgentClick }: AgentsListProps) => {
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
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agente encontrado</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm 
            ? `Não encontramos agentes que correspondam à busca "${searchTerm}"`
            : "Não há agentes com o filtro selecionado"
          }
        </p>
        {searchTerm && (
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <AgentCard 
          key={agent.id} 
          agent={agent} 
          onClick={() => onAgentClick?.(agent)}
        />
      ))}
    </div>
  );
};

export { mockAgents };
export type { Agent };
