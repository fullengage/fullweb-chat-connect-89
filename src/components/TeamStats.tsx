
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Target, TrendingUp } from "lucide-react";
import { Team } from "@/hooks/useTeams";

interface TeamStatsProps {
  teams: Team[];
}

export function TeamStats({ teams }: TeamStatsProps) {
  const totalTeams = teams.length;
  const activeTeams = teams.filter(team => team.is_active).length;
  const totalMembers = teams.reduce((acc, team) => acc + (team.member_ids?.length || 0), 0);
  const avgPerformance = teams.length > 0 
    ? teams.reduce((acc, team) => acc + team.performance_score, 0) / teams.length 
    : 0;

  const stats = [
    {
      title: "Total de Equipes",
      value: totalTeams,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Equipes Ativas",
      value: activeTeams,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total de Membros",
      value: totalMembers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Performance Média",
      value: `${avgPerformance.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
