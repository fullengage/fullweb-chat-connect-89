
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/NewAuthContext'
import { useToast } from '@/hooks/use-toast'
import { Conversation, User as BaseUser, Inbox as BaseInbox } from '@/types'

// Re-export User type so components can import it from here
export type User = BaseUser

export interface Contact {
  id: number
  account_id: number
  name: string
  email: string
  phone: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Extended Inbox interface with created_at property
export interface Inbox extends BaseInbox {
  created_at?: string
  updated_at?: string
  channel_type: string // Make this required for consistency
}

export type ConversationForStats = Pick<Conversation, 'id' | 'status'>

export const useConversations = (filters?: any) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          assignee:users(*),
          inbox:inboxes(*)
        `)
        .order('updated_at', { ascending: false })

      if (filters?.account_id) {
        query = query.eq('account_id', filters.account_id)
      }

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching conversations:', error)
        throw error
      }

      // Transform data to match our Conversation interface
      const transformedData = (data || []).map((conv: any) => ({
        id: conv.id,
        account_id: conv.account_id,
        contact_id: conv.contact_id,
        status: conv.status,
        assignee_id: conv.assignee_id,
        kanban_stage: conv.kanban_stage || 'novo',
        priority: (conv.priority === 'high' || conv.priority === 'medium' || conv.priority === 'low') 
          ? conv.priority 
          : 'medium' as const,
        last_activity_at: conv.last_activity_at || conv.updated_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        first_reply_created_at: conv.first_reply_created_at,
        waiting_since: conv.waiting_since,
        snoozed_until: conv.snoozed_until,
        unread_count: conv.unread_count || 0,
        additional_attributes: conv.additional_attributes,
        custom_attributes: conv.custom_attributes,
        subject: conv.subject,
        messages: [], // Initialize empty messages array
        contact: conv.contact ? {
          id: conv.contact.id,
          name: conv.contact.name || 'Unknown Contact',
          email: conv.contact.email,
          phone: conv.contact.phone,
          avatar_url: conv.contact.avatar_url,
          additional_attributes: conv.contact.additional_attributes
        } : undefined,
        assignee: conv.assignee ? {
          id: conv.assignee.id,
          name: conv.assignee.name || 'Unknown Assignee',
          avatar_url: conv.assignee.avatar_url
        } : undefined,
        inbox: {
          id: conv.inbox?.id || 1,
          name: conv.inbox?.name || 'Default Inbox',
          channel_type: conv.inbox?.channel_type || 'webchat'
        }
      }))

      return transformedData as Conversation[]
    },
    enabled: !!user,
  })
}

export const useUsers = (accountId?: number) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['users', accountId],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      let query = supabase
        .from('users')
        .select('*')
        .order('name')

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      // Transform data to match User interface
      const transformedData = (data || []).map((user: any) => ({
        id: user.id,
        account_id: user.account_id,
        name: user.name || 'Unknown User',
        email: user.email || 'no-email@example.com',
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }))

      return transformedData as User[]
    },
    enabled: !!user,
  })
}

export const useContacts = (accountId?: number) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['contacts', accountId],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      let query = supabase
        .from('contacts')
        .select('*')
        .order('name')

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching contacts:', error)
        throw error
      }

      // Transform data to match Contact interface
      const transformedData = (data || []).map((contact: any) => ({
        id: contact.id,
        account_id: contact.account_id,
        name: contact.name || 'Unknown Contact',
        email: contact.email || '',
        phone: contact.phone || '',
        avatar_url: contact.avatar_url,
        created_at: contact.created_at,
        updated_at: contact.updated_at
      }))

      return transformedData as Contact[]
    },
    enabled: !!user,
  })
}

export const useInboxes = (accountId?: number) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['inboxes', accountId],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      let query = supabase
        .from('inboxes')
        .select('*')
        .order('name')

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching inboxes:', error)
        throw error
      }

      return (data || []).map((inbox: any) => ({
        id: inbox.id,
        name: inbox.name,
        channel_type: inbox.channel_type || 'webchat',
        created_at: inbox.created_at,
        updated_at: inbox.updated_at
      })) as Inbox[]
    },
    enabled: !!user,
  })
}

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: number, status: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast({
        title: "Status atualizado",
        description: "O status da conversa foi atualizado com sucesso.",
      })
    },
    onError: (error: any) => {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conversa.",
        variant: "destructive",
      })
    },
  })
}

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
