
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Timer, Zap, AlertCircle } from "lucide-react"

interface ResponseTimeMetricsProps {
  avgFirstResponse: number
  avgResponseTime: number
  fastResponses: number
  slowResponses: number
  totalResponseTimes: number
}

export const ResponseTimeMetrics = ({
  avgFirstResponse,
  avgResponseTime,
  fastResponses,
  slowResponses,
  totalResponseTimes
}: ResponseTimeMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Primeira Resposta</CardTitle>
          <Zap className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgFirstResponse}min</div>
          <p className="text-xs text-muted-foreground mt-1">
            Baseado em {totalResponseTimes} conversas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgResponseTime}min</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tempo médio estimado entre mensagens
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Respostas Rápidas</CardTitle>
          <Timer className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fastResponses}</div>
          <Badge variant="outline" className="mt-green-600 border-green-600">
            &lt; 5 minutos
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Respostas Lentas</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{slowResponses}</div>
          <Badge variant="outline" className="mt-1 text-red-600 border-red-600">
            &gt; 30 minutos
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
