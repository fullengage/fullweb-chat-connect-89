import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Types
interface Account {
  id: number
  name: string
  slug: string
  plan: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  account_id: number
  role: 'superadmin' | 'admin' | 'agent'
  name: string
  email: string
  created_at: string
  updated_at: string
}

interface Contact {
  id: number
  account_id: number
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
  last_seen?: string
  custom_fields?: any
  created_at: string
  updated_at: string
}

interface Inbox {
  id: number
  account_id: number
  name: string
  channel_type: 'whatsapp' | 'email' | 'webchat'
  integration_id?: string
  settings?: any
  created_at: string
}

interface Conversation {
  id: number
  account_id: number
  contact_id: number
  inbox_id: number
  status: 'open' | 'pending' | 'resolved' | 'archived'
  assignee_id?: string
  kanban_stage: string
  priority?: 'high' | 'medium' | 'low'
  created_at: string
  updated_at: string
  contact?: Contact
  assignee?: User
  inbox?: Inbox
  messages?: Message[]
  unread_count: number
}

interface Message {
  id: number
  conversation_id: number
  sender_type: 'contact' | 'agent' | 'system'
  sender_id?: string
  content?: string
  attachments?: any
  read_at?: string
  created_at: string
}

interface KanbanStage {
  id: number
  account_id: number
  name: string
  position: number
  created_at: string
}

interface ConversationFilters {
  account_id: number
  status?: string
  assignee_id?: string
  inbox_id?: number
  kanban_stage?: string
}

// Hook para buscar conversas com realtime
export const useConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      console.log('Fetching conversations with filters:', filters)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assignee:users(*),
          inbox:inboxes(*),
          messages(*)
        `)
        .eq('account_id', filters.account_id)
        .order('updated_at', { ascending: false })

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

      if (filters.inbox_id) {
        query = query.eq('inbox_id', filters.inbox_id)
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

      // Calculate unread count for each conversation
      const conversationsWithUnread = data?.map(conversation => ({
        ...conversation,
        unread_count: conversation.messages?.filter((msg: any) => !msg.read_at && msg.sender_type === 'contact').length || 0
      })) || []

      console.log('Conversations fetched successfully:', conversationsWithUnread.length)
      return conversationsWithUnread as Conversation[]
    },
    enabled: !!filters.account_id && !!user,
    refetchInterval: 30000,
  })

  // Set up realtime subscription
  useEffect(() => {
    if (!user || !filters.account_id) return

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `account_id=eq.${filters.account_id}`
        },
        () => {
          // Invalidate and refetch conversations when changes occur
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
          // Invalidate conversations when messages change too
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, filters.account_id, queryClient])

  return query
}

// Hook para buscar usuários/agentes
export const useUsers = (account_id: number) => {
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['users', account_id],
    queryFn: async () => {
      console.log('Fetching users for account:', account_id)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_id', account_id)
        .order('name')

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Users fetched successfully:', data?.length)
      return data as User[]
    },
    enabled: !!account_id && !!user,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}

// Hook para buscar inboxes
export const useInboxes = (account_id: number) => {
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['inboxes', account_id],
    queryFn: async () => {
      console.log('Fetching inboxes for account:', account_id)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('inboxes')
        .select('*')
        .eq('account_id', account_id)
        .order('name')

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar inboxes",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Inboxes fetched successfully:', data?.length)
      return data as Inbox[]
    },
    enabled: !!account_id && !!user,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}

// Hook para buscar contatos
export const useContacts = (account_id: number) => {
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['contacts', account_id],
    queryFn: async () => {
      console.log('Fetching contacts for account:', account_id)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('account_id', account_id)
        .order('name')

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar contatos",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Contacts fetched successfully:', data?.length)
      return data as Contact[]
    },
    enabled: !!account_id && !!user,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}

// Hook para buscar estágios do kanban
export const useKanbanStages = (account_id: number) => {
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['kanban-stages', account_id],
    queryFn: async () => {
      console.log('Fetching kanban stages for account:', account_id)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('kanban_stages')
        .select('*')
        .eq('account_id', account_id)
        .order('position')

      if (error) {
        console.error('Database error:', error)
        toast({
          title: "Erro ao buscar estágios do kanban",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      console.log('Kanban stages fetched successfully:', data?.length)
      return data as KanbanStage[]
    },
    enabled: !!account_id && !!user,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}

// Hook para atualizar status da conversa
export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: number, status: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Status atualizado",
        description: "Status da conversa foi atualizado com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para atualizar estágio do kanban da conversa
export const useUpdateConversationKanbanStage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, kanbanStage }: { conversationId: number, kanbanStage: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ 
          kanban_stage: kanbanStage, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Estágio atualizado",
        description: "Conversa movida para novo estágio",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation kanban stage:', error)
      toast({
        title: "Erro ao atualizar estágio",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para criar uma nova conversa
export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (conversationData: {
      account_id: number
      contact_id: number
      inbox_id: number
      status?: string
      kanban_stage?: string
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Conversa criada",
        description: "Nova conversa criada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error creating conversation:', error)
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Hook para enviar mensagem
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (messageData: {
      conversation_id: number
      sender_type: 'contact' | 'agent' | 'system'
      sender_id?: string
      content: string
      attachments?: any
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso",
      })
    },
    onError: (error: any) => {
      console.error('Error sending message:', error)
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

// Export dos tipos para uso em outros arquivos
export type { 
  Account, 
  User, 
  Contact, 
  Inbox, 
  Conversation, 
  Message, 
  KanbanStage,
  ConversationFilters 
}
