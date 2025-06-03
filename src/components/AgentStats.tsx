
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Star } from "lucide-react";

const stats = [
  {
    title: "Total de Agentes",
    value: "6",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Agentes Ativos",
    value: "6",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Online Agora",
    value: "0",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Média de Avaliação",
    value: "4.8",
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

export const AgentStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
