
import { AgentCard } from "./AgentCard";

interface Agent {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  status: string;
  attendances: number;
  avgResponseTime: string;
  resolutionRate: number;
  rating: number;
  isOnline: boolean;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    initials: "MS",
    name: "Maria Silva",
    email: "agente1@empresademo.com",
    role: "agent",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  },
  {
    id: "2",
    initials: "JS",
    name: "João Santos",
    email: "agente2@empresademo.com",
    role: "agent",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  },
  {
    id: "3",
    initials: "AC",
    name: "Ana Costa",
    email: "supervisor@empresademo.com",
    role: "supervisor",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  },
  {
    id: "4",
    initials: "A",
    name: "Administrador",
    email: "admin@empresademo.com",
    role: "administrator",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  },
  {
    id: "5",
    initials: "MS",
    name: "Mariana Silva",
    email: "mariana@gmail.com",
    role: "agent",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  },
  {
    id: "6",
    initials: "MC",
    name: "Marina Cardoso",
    email: "marina@gmail.com",
    role: "agent",
    status: "Ativo",
    attendances: 0,
    avgResponseTime: "0s",
    resolutionRate: 0,
    rating: 0,
    isOnline: false
  }
];

interface AgentsListProps {
  searchTerm: string;
  roleFilter: string;
}

export const AgentsList = ({ searchTerm, roleFilter }: AgentsListProps) => {
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || agent.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
};
