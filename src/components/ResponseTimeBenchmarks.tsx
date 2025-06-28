
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResponseTimeBenchmarksProps {
  avgFirstResponse: number
  avgResponseTime: number
  totalResponseTimes: number
  fastResponses: number
  slowResponses: number
  agentCount: number
}

export const ResponseTimeBenchmarks = ({
  avgFirstResponse,
  avgResponseTime,
  totalResponseTimes,
  fastResponses,
  slowResponses,
  agentCount
}: ResponseTimeBenchmarksProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas e Benchmarks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Meta: Primeira Resposta</span>
            <Badge variant={avgFirstResponse <= 15 ? "default" : "destructive"}>
              {avgFirstResponse <= 15 ? "✓ Atingida" : "✗ Não Atingida"}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${avgFirstResponse <= 15 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${Math.min((15 / Math.max(avgFirstResponse, 1)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">Meta: 15 minutos</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Meta: Tempo Médio</span>
            <Badge variant={avgResponseTime <= 10 ? "default" : "destructive"}>
              {avgResponseTime <= 10 ? "✓ Atingida" : "✗ Não Atingida"}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${avgResponseTime <= 10 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${Math.min((10 / Math.max(avgResponseTime, 1)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">Meta: 10 minutos</p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Insights dos Dados</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {totalResponseTimes} conversas analisadas</li>
            <li>• {fastResponses} respostas em menos de 5 minutos</li>
            <li>• {slowResponses} respostas lentas identificadas</li>
            {agentCount > 0 && (
              <li>• {agentCount} agentes com atividade</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
