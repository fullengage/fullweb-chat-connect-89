
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ConversationFilters {
  account_id: number
  status?: string
  assignee_id?: number
  inbox_id?: number
}

interface Conversation {
  id: number
  messages: any[]
  account_id: number
  inbox_id: number
  status: string
  assignee_id?: number
  contact_last_seen_at: string
  agent_last_seen_at: string
  unread_count: number
  additional_attributes: any
  custom_attributes: any
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  contact: {
    id: number
    name: string
    email?: string
    phone_number?: string
    avatar_url?: string
  }
  assignee?: {
    id: number
    name: string
    email: string
    avatar_url?: string
  }
  team?: {
    id: number
    name: string
  }
  labels: string[]
  timestamp: string
  created_at: string
  updated_at: string
}

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
  available?: boolean
  role: string
}

interface Inbox {
  id: number
  name: string
  channel_type: string
  avatar_url?: string
  website_url?: string
  welcome_title?: string
  welcome_tagline?: string
  enable_auto_assignment: boolean
}

export const useChatwootConversations = (filters: ConversationFilters) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-conversations', filters],
    queryFn: async () => {
      console.log('Fetching conversations with filters:', filters)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase.functions.invoke('chatwoot-conversations', {
        body: filters,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (error) {
        console.error('Supabase function error:', error)
        toast({
          title: "Error fetching conversations",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Chatwoot API Error",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Conversations fetched successfully:', data.data.length)
      return data.data as Conversation[]
    },
    enabled: !!filters.account_id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })
}

export const useChatwootAgents = (account_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-agents', account_id],
    queryFn: async () => {
      console.log('Fetching agents for account:', account_id)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase.functions.invoke('chatwoot-agents', {
        body: { account_id },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (error) {
        console.error('Supabase function error:', error)
        toast({
          title: "Error fetching agents",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Chatwoot API Error",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Agents fetched successfully:', data.data.length)
      return data.data as Agent[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}

export const useChatwootInboxes = (account_id: number) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['chatwoot-inboxes', account_id],
    queryFn: async () => {
      console.log('Fetching inboxes for account:', account_id)
      
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase.functions.invoke('chatwoot-inboxes', {
        body: { account_id },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (error) {
        console.error('Supabase function error:', error)
        toast({
          title: "Error fetching inboxes",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      if (!data.success) {
        console.error('Chatwoot API error:', data.error)
        toast({
          title: "Chatwoot API Error",
          description: data.error,
          variant: "destructive",
        })
        throw new Error(data.error)
      }

      console.log('Inboxes fetched successfully:', data.data.length)
      return data.data as Inbox[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  })
}
