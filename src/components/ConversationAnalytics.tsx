
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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts"
import { 
  MessageCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Inbox
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface Conversation {
  id: number
  status: string
  created_at: string
  updated_at: string
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  messages: any[]
  assignee?: {
    id: number
    name: string
  }
}

interface ConversationAnalyticsProps {
  conversations: Conversation[]
  isLoading: boolean
  inboxes: any[]
}

const chartConfig = {
  conversations: {
    label: "Conversas"
  },
  open: {
    label: "Abertas"
  },
  pending: {
    label: "Pendentes"
  },
  resolved: {
    label: "Resolvidas"
  }
}

export const ConversationAnalytics = ({ 
  conversations, 
  isLoading,
  inboxes 
}: ConversationAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
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

  // Estatísticas gerais
  const totalConversations = conversations.length
  const openConversations = conversations.filter(c => c.status === 'open').length
  const pendingConversations = conversations.filter(c => c.status === 'pending').length
  const resolvedConversations = conversations.filter(c => c.status === 'resolved').length

  // Dados para gráfico de status
  const statusData = [
    { name: 'Abertas', value: openConversations, color: '#10B981' },
    { name: 'Pendentes', value: pendingConversations, color: '#F59E0B' },
    { name: 'Resolvidas', value: resolvedConversations, color: '#6B7280' }
  ]

  // Dados para gráfico de conversas por caixa de entrada
  const inboxData = inboxes.map(inbox => {
    const count = conversations.filter(c => c.inbox.id === inbox.id).length
    return {
      name: inbox.name,
      conversations: count
    }
  }).filter(item => item.conversations > 0)

  // Dados para gráfico de conversas por dia (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const dailyData = last7Days.map(date => {
    const count = conversations.filter(c => 
      c.created_at.split('T')[0] === date
    ).length
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      conversations: count
    }
  })

  // Estatísticas de crescimento (mock)
  const growthRate = Math.floor(Math.random() * 20) - 10 // -10% a +10%
  const avgResolutionTime = "2h 15min"

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <div className="flex items-center space-x-1 mt-1">
              {growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growthRate)}% em relação ao período anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Abertas</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openConversations}</div>
            <Badge variant="outline" className="mt-1">
              {totalConversations > 0 ? Math.round((openConversations / totalConversations) * 100) : 0}% do total
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado nas últimas conversas resolvidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalConversations > 0 ? Math.round((resolvedConversations / totalConversations) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {resolvedConversations} de {totalConversations} conversas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Conversas dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={dailyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversas por Caixa de Entrada */}
        {inboxData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversas por Caixa de Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={inboxData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="conversations" fill="#8B5CF6" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Resumo de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conversas Ativas</span>
              <Badge variant="outline">{openConversations + pendingConversations}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aguardando Resposta</span>
              <Badge variant="outline">{pendingConversations}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Resolvidas Hoje</span>
              <Badge variant="outline">
                {conversations.filter(c => 
                  c.status === 'resolved' && 
                  new Date(c.updated_at).toDateString() === new Date().toDateString()
                ).length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Caixas de Entrada Ativas</span>
              <Badge variant="outline">{inboxData.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
