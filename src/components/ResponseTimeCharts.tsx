
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  YAxis
} from "recharts"

interface ResponseTimeChartsProps {
  hourlyData: Array<{
    hour: string
    responseTime: number
    conversations: number
  }>
  agentData: Array<{
    name: string
    avgResponse: number
    conversations: number
  }>
  trendData: Array<{
    date: string
    responseTime: number
  }>
}

const chartConfig = {
  responseTime: {
    label: "Tempo de Resposta (min)"
  },
  average: {
    label: "Média"
  }
}

export const ResponseTimeCharts = ({
  hourlyData,
  agentData,
  trendData
}: ResponseTimeChartsProps) => {
  return (
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
          {agentData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum agente com dados disponíveis
            </div>
          )}
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
    </div>
  )
}
