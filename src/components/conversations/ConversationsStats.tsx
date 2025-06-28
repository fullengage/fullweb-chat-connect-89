
import { Card, CardContent } from "@/components/ui/card"

interface ConversationsStatsProps {
  stats: {
    total: number
    open: number
    pending: number
    resolved: number
    unassigned: number
  }
}

export const ConversationsStats = ({ stats }: ConversationsStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          <div className="text-sm text-gray-600">Abertas</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolvidas</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.unassigned}</div>
          <div className="text-sm text-gray-600">Sem agente</div>
        </CardContent>
      </Card>
    </div>
  )
}
