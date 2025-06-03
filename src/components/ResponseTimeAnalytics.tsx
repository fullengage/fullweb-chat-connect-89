
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts"
import { Clock, Timer, Zap, AlertCircle } from "lucide-react"

interface Conversation {
  id: number
  status: string
  created_at: string
  updated_at: string
  messages: any[]
  assignee?: {
    id: number
    name: string
  }
}

interface ResponseTimeAnalyticsProps {
  conversations: Conversation[]
  agents: any[]
  isLoading: boolean
}

const chartConfig = {
  responseTime: {
    label: "Tempo de Resposta (min)"
  },
  average: {
    label: "Média"
  }
}

export const ResponseTimeAnalytics = ({ 
  conversations, 
  agents, 
  isLoading 
}: ResponseTimeAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calcular métricas de tempo de resposta (simuladas)
  const generateResponseTime = () => Math.floor(Math.random() * 120) + 5 // 5-125 minutos
  
  const avgFirstResponse = Math.floor(Math.random() * 30) + 10 // 10-40 min
  const avgResponseTime = Math.floor(Math.random() * 15) + 5 // 5-20 min
  const fastResponses = conversations.filter(() => Math.random() > 0.7).length
  const slowResponses = conversations.filter(() => Math.random() > 0.8).length

  // Dados para gráfico de tempo de resposta por hora
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    responseTime: generateResponseTime(),
    conversations: Math.floor(Math.random() * 10)
  }))

  // Dados para gráfico de performance por agente
  const agentData = agents.slice(0, 5).map(agent => ({
    name: agent.name,
    avgResponse: generateResponseTime(),
    conversations: Math.floor(Math.random() * 20) + 5
  }))

  // Dados para tendência dos últimos 7 dias
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      responseTime: generateResponseTime()
    }
  }).reverse()

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primeira Resposta</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFirstResponse}min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo médio para primeira resposta
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
              Tempo médio entre mensagens
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
            <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tempo de Resposta por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={hourlyData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo de Resposta']}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance por Agente */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={agentData} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Bar dataKey="avgResponse" fill="#8B5CF6" />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo Médio']}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tendência dos Últimos 7 Dias */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} min`, 'Tempo Médio']}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Metas e Benchmarks */}
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
                  style={{ width: `${Math.min((15 / avgFirstResponse) * 100, 100)}%` }}
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
                  style={{ width: `${Math.min((10 / avgResponseTime) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">Meta: 10 minutos</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Recomendações</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Implemente respostas automáticas</li>
                <li>• Treine equipe em horários de pico</li>
                <li>• Configure alertas para conversas pendentes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
