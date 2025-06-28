
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface Agent {
  id: string
  account_id: number
  name: string
  email: string
  phone?: string
  role: 'agent' | 'supervisor' | 'administrator'
  status: 'online' | 'offline' | 'busy' | 'away'
  teams: string[]
  avatar_url?: string
  is_active: boolean
  last_activity: string
  created_at: string
  updated_at: string
}

export interface AgentStats {
  id: string
  agent_id: string
  conversations_today: number
  avg_response_time_seconds: number
  resolution_rate: number
  rating: number
  attendances: number
  date: string
  created_at: string
  updated_at: string
}

export interface AgentWithStats extends Agent {
  stats?: AgentStats
  initials: string
  isOnline: boolean
  conversationsToday: number
  avgResponseTime: string
  resolutionRate: number
}

// Hook para buscar agentes
export const useAgents = () => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['agents', authUser?.id],
    queryFn: async () => {
      console.log('Fetching agents from database...')
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar agentes com suas estatísticas
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          agent_stats (*)
        `)
        .eq('is_active', true)
        .order('name')

      if (agentsError) {
        console.error('Database error:', agentsError)
        toast({
          title: "Erro ao buscar agentes",
          description: agentsError.message,
          variant: "destructive",
        })
        throw agentsError
      }

      // Transform data to match the expected format
      const agentsWithStats: AgentWithStats[] = agentsData?.map(agent => {
        const stats = agent.agent_stats?.[0] // Get today's stats
        const initials = agent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        
        return {
          ...agent,
          role: agent.role as 'agent' | 'supervisor' | 'administrator', // Type assertion
          status: agent.status as 'online' | 'offline' | 'busy' | 'away', // Type assertion
          stats,
          initials,
          isOnline: agent.status === 'online',
          conversationsToday: stats?.conversations_today || 0,
          avgResponseTime: formatResponseTime(stats?.avg_response_time_seconds || 0),
          resolutionRate: stats?.resolution_rate || 0,
        }
      }) || []

      console.log('Agents fetched successfully:', agentsWithStats.length)
      return agentsWithStats
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para atualizar agente
export const useUpdateAgent = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (agentData: Partial<Agent> & { id: string }) => {
      const { id, ...updateData } = agentData
      
      const { data, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast({
        title: "Agente atualizado",
        description: "As informações do agente foram atualizadas com sucesso.",
      })
    },
    onError: (error: any) => {
      console.error('Error updating agent:', error)
      toast({
        title: "Erro ao atualizar agente",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar novo agente
export const useCreateAgent = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'> & { password: string }) => {
      console.log('Creating new agent with authentication...')
      
      // 1. Primeiro, criar o usuário autenticado no Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: agentData.email,
        password: agentData.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: agentData.name,
          role: agentData.role
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        throw new Error(`Erro ao criar conta de autenticação: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário autenticado')
      }

      console.log('Auth user created:', authData.user.id)

      try {
        // 2. Criar registro na tabela users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authData.user.id,
            account_id: agentData.account_id,
            name: agentData.name,
            email: agentData.email,
            phone: agentData.phone,
            role: agentData.role,
            isactive: true
          })

        if (userError) {
          console.error('Error creating user record:', userError)
          // Se falhar, deletar o usuário autenticado criado
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw new Error(`Erro ao criar registro do usuário: ${userError.message}`)
        }

        // 3. Criar registro na tabela agents
        const { data: agentRecord, error: agentError } = await supabase
          .from('agents')
          .insert({
            account_id: agentData.account_id,
            name: agentData.name,
            email: agentData.email,
            phone: agentData.phone,
            role: agentData.role,
            status: agentData.status,
            teams: agentData.teams,
            is_active: true,
            last_activity: new Date().toISOString()
          })
          .select()
          .single()

        if (agentError) {
          console.error('Error creating agent record:', agentError)
          // Se falhar, deletar o usuário autenticado criado
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw new Error(`Erro ao criar registro do agente: ${agentError.message}`)
        }

        // 4. Criar estatísticas iniciais do agente
        await supabase
          .from('agent_stats')
          .insert({
            agent_id: agentRecord.id,
            conversations_today: 0,
            avg_response_time_seconds: 0,
            resolution_rate: 0,
            rating: 0,
            attendances: 0
          })

        console.log('Agent created successfully:', agentRecord.id)
        return agentRecord

      } catch (error) {
        // Se algo der errado após criar o usuário autenticado, limpar
        console.error('Error in agent creation process:', error)
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast({
        title: "Agente criado com sucesso",
        description: "O agente foi criado e pode fazer login no sistema.",
      })
    },
    onError: (error: any) => {
      console.error('Error creating agent:', error)
      toast({
        title: "Erro ao criar agente",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Utility function to format response time
function formatResponseTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
}
