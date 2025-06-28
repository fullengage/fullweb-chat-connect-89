
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Conversation } from '@/types'

interface ConversationFilters {
  account_id: number
  status?: string
  assignee_id?: string
  kanban_stage?: string
}

// Global channel registry to prevent duplicate subscriptions
const activeChannels = new Map<string, any>()

// ✅ Função para sanitizar filtros
const sanitizeFilters = (filters: ConversationFilters): ConversationFilters | null => {
  // Validar account_id
  if (!filters.account_id || typeof filters.account_id !== 'number' || filters.account_id <= 0) {
    console.warn('❌ Invalid account_id in filters:', filters.account_id)
    return null
  }

  const sanitized: ConversationFilters = {
    account_id: filters.account_id
  }

  // Sanitizar status
  if (filters.status && typeof filters.status === 'string' && filters.status.trim() !== '' && filters.status !== 'all') {
    sanitized.status = filters.status.trim()
  }

  // Sanitizar assignee_id
  if (filters.assignee_id && typeof filters.assignee_id === 'string' && filters.assignee_id.trim() !== '' && filters.assignee_id !== 'all') {
    sanitized.assignee_id = filters.assignee_id.trim()
  }

  // Sanitizar kanban_stage
  if (filters.kanban_stage && typeof filters.kanban_stage === 'string' && filters.kanban_stage.trim() !== '') {
    sanitized.kanban_stage = filters.kanban_stage.trim()
  }

  return sanitized
}

export const useConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const hookInstanceId = useRef(Math.random().toString(36).substr(2, 9))

  const query = useQuery({
    queryKey: ['conversations', filters, authUser?.id],
    queryFn: async () => {
      console.log('🔍 Fetching conversations with filters:', filters)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // ✅ Sanitizar filtros antes de usar
      const sanitizedFilters = sanitizeFilters(filters)
      if (!sanitizedFilters) {
        console.warn('❌ Invalid filters provided, returning empty array')
        return []
      }

      try {
        // Buscar dados do usuário na nossa tabela users
        console.log('📤 Fetching current user data...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single()

        if (userError || !userData) {
          console.error('❌ User data error:', userError)
          throw new Error('User data not found')
        }

        console.log('✅ Current user data loaded:', { 
          id: userData.id, 
          role: userData.role, 
          account_id: userData.account_id 
        })

        // ✅ Construir query - As políticas RLS agora filtram automaticamente
        let query = supabase
          .from('conversations')
          .select(`
            *,
            contact:contacts(*),
            assignee:users(*),
            messages:messages(
              id,
              content,
              sender_type,
              sender_id,
              created_at,
              message_type,
              status
            )
          `)
          .order('updated_at', { ascending: false })

        // ✅ Aplicar apenas filtros de conta para superadmins e admins
        // Para agentes, as políticas RLS já limitam às conversas atribuídas
        if (userData.role === 'superadmin' && sanitizedFilters.account_id) {
          query = query.eq('account_id', sanitizedFilters.account_id)
          console.log('🔧 Applied superadmin account filter:', sanitizedFilters.account_id)
        } else if (userData.role === 'admin') {
          query = query.eq('account_id', userData.account_id)
          console.log('🔧 Applied admin account filter:', userData.account_id)
        } else if (userData.role === 'agent') {
          // Para agentes, aplicar filtro de conta mas as RLS policies já limitam às atribuídas
          query = query.eq('account_id', userData.account_id)
          console.log('🔧 Applied agent account filter - RLS will filter to assigned conversations')
        }

        // Aplicar filtros adicionais
        if (sanitizedFilters.status) {
          query = query.eq('status', sanitizedFilters.status)
          console.log('🔧 Applied status filter:', sanitizedFilters.status)
        }

        if (sanitizedFilters.assignee_id) {
          if (sanitizedFilters.assignee_id === 'unassigned') {
            query = query.is('assignee_id', null)
            console.log('🔧 Applied unassigned filter')
          } else {
            query = query.eq('assignee_id', sanitizedFilters.assignee_id)
            console.log('🔧 Applied assignee filter:', sanitizedFilters.assignee_id)
          }
        }

        if (sanitizedFilters.kanban_stage) {
          query = query.eq('kanban_stage', sanitizedFilters.kanban_stage)
          console.log('🔧 Applied kanban_stage filter:', sanitizedFilters.kanban_stage)
        }

        console.log('📤 Executing conversations query...')
        const { data, error } = await query

        if (error) {
          console.error('❌ Database error:', error)
          
          // ✅ Tratamento específico de erros
          let errorMessage = 'Erro ao buscar conversas'
          if (error.message.includes('permission')) {
            errorMessage = 'Sem permissão para acessar conversas'
          } else if (error.message.includes('connection')) {
            errorMessage = 'Erro de conexão com o banco de dados'
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Tempo limite excedido'
          }
          
          toast({
            title: "Erro ao buscar conversas",
            description: errorMessage,
            variant: "destructive",
          })
          throw error
        }

        // ✅ Validar dados retornados
        if (!Array.isArray(data)) {
          console.warn('❌ Invalid data format received')
          return []
        }

        // Transform data to include inbox information and organize messages
        const conversationsWithMessages = data.map(conversation => {
          // Ordenar mensagens por data (mais antiga primeiro)
          const sortedMessages = (conversation.messages || []).sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          return {
            ...conversation,
            inbox: {
              id: 1,
              name: 'Chat Interno',
              channel_type: 'webchat'
            },
            messages: sortedMessages,
            unread_count: 0
          }
        })

        console.log('✅ Conversations with messages fetched successfully:', conversationsWithMessages.length)
        console.log('✅ User role:', userData.role, '- Conversations returned:', conversationsWithMessages.length)
        return conversationsWithMessages as Conversation[]
        
      } catch (error: any) {
        console.error('❌ Error in useConversations:', error)
        throw error
      }
    },
    enabled: !!authUser && !!sanitizeFilters(filters),
    refetchInterval: 30000,
    retry: (failureCount, error: any) => {
      // ✅ Retry logic customizado
      if (failureCount >= 3) return false
      if (error?.message?.includes('permission')) return false
      if (error?.message?.includes('User data not found')) return false
      return true
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Set up realtime subscription with improved channel management
  useEffect(() => {
    if (!authUser || !filters.account_id) return

    const sanitizedFilters = sanitizeFilters(filters)
    if (!sanitizedFilters) return

    const channelKey = `conversations-${sanitizedFilters.account_id}`
    const instanceChannelKey = `${channelKey}-${hookInstanceId.current}`

    // Check if a channel for this account already exists
    let channel = activeChannels.get(channelKey)
    
    if (!channel) {
      console.log('📡 Creating new realtime subscription for account:', sanitizedFilters.account_id)
      
      channel = supabase
        .channel(instanceChannelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `account_id=eq.${sanitizedFilters.account_id}`
          },
          () => {
            console.log('📡 Conversations realtime update received')
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            console.log('📡 Messages realtime update received')
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )

      // Subscribe only once
      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates')
          activeChannels.set(channelKey, channel)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription error')
          activeChannels.delete(channelKey)
        }
      })
    } else {
      console.log('♻️ Reusing existing realtime subscription for account:', sanitizedFilters.account_id)
    }

    return () => {
      console.log('🧹 Cleaning up realtime subscription for instance:', hookInstanceId.current)
      // Only clean up if this is the last instance using this channel
      const currentChannel = activeChannels.get(channelKey)
      if (currentChannel) {
        // In a real app, you'd want to track how many instances are using the channel
        // For now, we'll clean up after a delay to allow other instances to reuse
        setTimeout(() => {
          const stillActiveChannel = activeChannels.get(channelKey)
          if (stillActiveChannel) {
            console.log('🗑️ Removing channel from active channels')
            supabase.removeChannel(stillActiveChannel)
            activeChannels.delete(channelKey)
          }
        }, 1000)
      }
    }
  }, [authUser?.id, filters.account_id, queryClient])

  return query
}

export type { ConversationFilters }
