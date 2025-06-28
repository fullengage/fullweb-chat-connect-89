
import { Conversation } from "@/types"
import { User } from "@/hooks/useSupabaseData"
import { ResponseTimeMetrics } from "./ResponseTimeMetrics"
import { ResponseTimeCharts } from "./ResponseTimeCharts"
import { ResponseTimeBenchmarks } from "./ResponseTimeBenchmarks"
import { 
  calculateResponseMetrics, 
  generateHourlyData, 
  generateAgentData, 
  generateTrendData 
} from "./ResponseTimeUtils"

interface ResponseTimeAnalyticsProps {
  conversations: Conversation[]
  agents: User[]
  isLoading: boolean
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
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  // Calcular métricas usando as funções utilitárias
  const {
    avgFirstResponse,
    avgResponseTime,
    fastResponses,
    slowResponses,
    totalResponseTimes
  } = calculateResponseMetrics(conversations)

  // Gerar dados para gráficos
  const hourlyData = generateHourlyData(conversations)
  const agentData = generateAgentData(conversations, agents)
  const trendData = generateTrendData(conversations)

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <ResponseTimeMetrics
        avgFirstResponse={avgFirstResponse}
        avgResponseTime={avgResponseTime}
        fastResponses={fastResponses}
        slowResponses={slowResponses}
        totalResponseTimes={totalResponseTimes}
      />

      {/* Gráficos */}
      <ResponseTimeCharts
        hourlyData={hourlyData}
        agentData={agentData}
        trendData={trendData}
      />

      {/* Metas e Benchmarks */}
      <ResponseTimeBenchmarks
        avgFirstResponse={avgFirstResponse}
        avgResponseTime={avgResponseTime}
        totalResponseTimes={totalResponseTimes}
        fastResponses={fastResponses}
        slowResponses={slowResponses}
        agentCount={agentData.length}
      />
    </div>
  )
}
