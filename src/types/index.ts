
export interface Agent {
  id: string
  name: string
  email: string
}

export interface ConversationForStats {
  id: number
  status: string
  unread_count: number
  contact: {
    id: number
    name: string
    email?: string
    avatar_url?: string
  }
  assignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  inbox: {
    id: number
    name: string
    channel_type: string
  }
  updated_at: string
  messages: any[]
}
