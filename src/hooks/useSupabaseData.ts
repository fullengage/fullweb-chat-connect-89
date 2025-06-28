// Re-export all hooks from individual files for backward compatibility
export { useConversations } from './useConversations'
export { useUsers } from './useUsers'
export { useContacts } from './useContacts'
export { useInboxes, useKanbanStages } from './useMockData'
export { 
  useUpdateConversationStatus,
  useUpdateConversationKanbanStage,
  useCreateConversation,
  useSendMessage,
  useAssignConversation
} from './useMutations'

// Re-export types
export type { ConversationFilters } from './useConversations'
export type { User } from './useUsers'
export type { Contact } from './useContacts'
export type { Inbox, KanbanStage } from './useMockData'

// Keep legacy types for backward compatibility
interface Account {
  id: number
  name: string
  slug: string
  plan: string
  created_at: string
  updated_at: string
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

export type { Account, Message }
