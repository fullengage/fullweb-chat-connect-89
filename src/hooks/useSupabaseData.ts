import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/NewAuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Contact {
  id: number
  account_id: number
  name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  account_id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface Inbox {
  id: number
  account_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  account_id: number
  contact_id: number
  inbox_id: number
  status: string
  assignee_id: string | null
  created_at: string
  updated_at: string
  contact?: Contact
  assignee?: User
  inbox?: Inbox
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

      return data || []
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

      return data || []
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

      return data || []
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
