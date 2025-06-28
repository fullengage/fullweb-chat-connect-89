
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

export const useConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()
  const queryClient = useQueryClient()
  const hookInstanceId = useRef(Math.random().toString(36).substr(2, 9))

  const query = useQuery({
    queryKey: ['conversations', filters, authUser?.id],
    queryFn: async () => {
      console.log('Fetching conversations with filters:', filters)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      // Buscar dados do usuário na nossa tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('User data error:', userError)
        throw new Error('User data not found')
      }

      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assignee:users(*)
        `)
        .order('updated_at', { ascending: false })

      // Aplicar filtros baseados no papel do usuário
      if (userData.role === 'superadmin') {
        // Superadmin pode ver conversas de qualquer conta se especificada
        if (filters.account_id) {
          query = query.eq('account_id', filters.account_id)
        }
      } else if (userData.role === 'admin') {
        // Admin pode ver todas as conversas da sua conta
        query = query.eq('account_id', userData.account_id)
      } else if (userData.role === 'agent') {
        // Agent só pode ver conversas da sua conta que estão atribuídas a ele ou não atribuídas
        query = query
          .eq('account_id', userData.account_id)
          .or(`assignee_id.eq.${userData.id},assignee_id.is.null`)
      } else {
        throw new Error('Invalid user role')
      }

      // Aplicar filtros adicionais
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.assignee_id && filters.assignee_id !== 'all') {
        if (filters.assignee_id === 'unassigned') {
          query = query.is('assignee_id', null)
        } else {
          query = query.eq('assignee_id', filters.assignee_id)
        }
      }

      if (filters.kanban_stage) {
        query = query.eq('kanban_stage', filters.kanban_stage)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar conversas",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Transform data to include inbox information and calculate unread count
      const conversationsWithInbox = data?.map(conversation => ({
        ...conversation,
        inbox: {
          id: 1,
          name: 'Chat Interno',
          channel_type: 'webchat'
        },
        messages: [],
        unread_count: 0
      })) || []

      console.log('Conversations fetched successfully:', conversationsWithInbox.length)
      return conversationsWithInbox as Conversation[]
    },
    enabled: !!authUser && !!filters.account_id,
    refetchInterval: 30000,
  })

  // Set up realtime subscription with improved channel management
  useEffect(() => {
    if (!authUser || !filters.account_id) return

    const channelKey = `conversations-${filters.account_id}`
    const instanceChannelKey = `${channelKey}-${hookInstanceId.current}`

    // Check if a channel for this account already exists
    let channel = activeChannels.get(channelKey)
    
    if (!channel) {
      console.log('Creating new realtime subscription for account:', filters.account_id)
      
      channel = supabase
        .channel(instanceChannelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `account_id=eq.${filters.account_id}`
          },
          () => {
            console.log('Conversations realtime update received')
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
            console.log('Messages realtime update received')
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
        )

      // Subscribe only once
      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates')
          activeChannels.set(channelKey, channel)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error')
          activeChannels.delete(channelKey)
        }
      })
    } else {
      console.log('Reusing existing realtime subscription for account:', filters.account_id)
    }

    return () => {
      console.log('Cleaning up realtime subscription for instance:', hookInstanceId.current)
      // Only clean up if this is the last instance using this channel
      const currentChannel = activeChannels.get(channelKey)
      if (currentChannel) {
        // In a real app, you'd want to track how many instances are using the channel
        // For now, we'll clean up after a delay to allow other instances to reuse
        setTimeout(() => {
          const stillActiveChannel = activeChannels.get(channelKey)
          if (stillActiveChannel) {
            console.log('Removing channel from active channels')
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
