
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, AlertTriangle, Star } from "lucide-react";

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

interface AgentCardProps {
  agent: Agent;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "agent":
      return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Agente</Badge>;
    case "supervisor":
      return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Supervisor</Badge>;
    case "administrator":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Administrador</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

export const AgentCard = ({ agent }: AgentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {agent.initials}
              {agent.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600">{agent.email}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          {getRoleBadge(agent.role)}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center justify-between">
            <span>👥 {agent.attendances} atendimentos</span>
          </div>
          <div className="flex items-center justify-between">
            <span>⏱️ Resp. média: {agent.avgResponseTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-green-600">📈 {agent.resolutionRate}% resolução</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{agent.rating}/5</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {agent.status}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
