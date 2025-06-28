
import { useQuery } from '@tanstack/react-query'

interface Inbox {
  id: number
  name: string
  channel_type: string
  created_at?: string
}

interface KanbanStage {
  id: number
  account_id: number
  name: string
  position: number
  created_at: string
}

// Mock hook for inboxes since table doesn't exist
export const useInboxes = (account_id: number) => {
  return useQuery({
    queryKey: ['inboxes', account_id],
    queryFn: async () => {
      // Return mock data since inboxes table doesn't exist
      return [
        { id: 1, name: 'WhatsApp', channel_type: 'whatsapp', created_at: new Date().toISOString() },
        { id: 2, name: 'Email', channel_type: 'email', created_at: new Date().toISOString() },
        { id: 3, name: 'Website', channel_type: 'webchat', created_at: new Date().toISOString() }
      ] as Inbox[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

// Mock hook for kanban stages since table doesn't exist
export const useKanbanStages = (account_id: number) => {
  return useQuery({
    queryKey: ['kanban-stages', account_id],
    queryFn: async () => {
      // Return mock data since kanban_stages table doesn't exist
      return [
        { id: 1, account_id, name: 'Novo', position: 1, created_at: new Date().toISOString() },
        { id: 2, account_id, name: 'Em Andamento', position: 2, created_at: new Date().toISOString() },
        { id: 3, account_id, name: 'Aguardando', position: 3, created_at: new Date().toISOString() },
        { id: 4, account_id, name: 'Resolvido', position: 4, created_at: new Date().toISOString() }
      ] as KanbanStage[]
    },
    enabled: !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

export type { Inbox, KanbanStage }
