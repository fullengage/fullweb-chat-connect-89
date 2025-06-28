
import { Conversation } from "@/types"
import { User } from "@/hooks/useSupabaseData"

export const calculateResponseTime = (conversation: Conversation) => {
  if (!conversation.created_at || !conversation.updated_at) return 0
  const created = new Date(conversation.created_at).getTime()
  const updated = new Date(conversation.updated_at).getTime()
  return Math.floor((updated - created) / (1000 * 60)) // em minutos
}

export const calculateResponseMetrics = (conversations: Conversation[]) => {
  const responseTimes = conversations
    .filter(c => c.created_at && c.updated_at)
    .map(calculateResponseTime)
    .filter(time => time > 0)

  const avgFirstResponse = responseTimes.length > 0
    ? Math.floor(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    : 0

  const avgResponseTime = Math.floor(avgFirstResponse * 0.7) // Estimativa para tempo médio entre mensagens
  const fastResponses = responseTimes.filter(time => time <= 5).length
  const slowResponses = responseTimes.filter(time => time > 30).length

  return {
    avgFirstResponse,
    avgResponseTime,
    fastResponses,
    slowResponses,
    totalResponseTimes: responseTimes.length
  }
}

export const generateHourlyData = (conversations: Conversation[]) => {
  return Array.from({ length: 24 }, (_, hour) => {
    const hourConversations = conversations.filter(c => {
      if (!c.created_at) return false
      const createdHour = new Date(c.created_at).getHours()
      return createdHour === hour
    })
    
    const hourResponseTimes = hourConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgTime = hourResponseTimes.length > 0
      ? Math.floor(hourResponseTimes.reduce((sum, time) => sum + time, 0) / hourResponseTimes.length)
      : 0

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      responseTime: avgTime,
      conversations: hourConversations.length
    }
  })
}

export const generateAgentData = (conversations: Conversation[], agents: User[]) => {
  return agents.slice(0, 5).map(agent => {
    const agentConversations = conversations.filter(c => c.assignee?.id === agent.id)
    const agentResponseTimes = agentConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgResponse = agentResponseTimes.length > 0
      ? Math.floor(agentResponseTimes.reduce((sum, time) => sum + time, 0) / agentResponseTimes.length)
      : 0

    return {
      name: agent.name,
      avgResponse,
      conversations: agentConversations.length
    }
  }).filter(agent => agent.conversations > 0)
}

export const generateTrendData = (conversations: Conversation[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  return last7Days.map(date => {
    const dayConversations = conversations.filter(c => 
      c.created_at && c.created_at.split('T')[0] === date
    )
    
    const dayResponseTimes = dayConversations
      .map(calculateResponseTime)
      .filter(time => time > 0)
    
    const avgTime = dayResponseTimes.length > 0
      ? Math.floor(dayResponseTimes.reduce((sum, time) => sum + time, 0) / dayResponseTimes.length)
      : 0

    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      responseTime: avgTime
    }
  })
}
