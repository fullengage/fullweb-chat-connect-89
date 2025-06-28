
import { MessageCircle } from "lucide-react"
import { Conversation } from "@/types"
import { ConversationCard } from "./ConversationCard"

interface ConversationListProps {
  conversations: Conversation[]
  onConversationClick: (conversation: Conversation) => void
}

export const ConversationList = ({ 
  conversations, 
  onConversationClick 
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma conversa encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onClick={() => onConversationClick(conversation)}
        />
      ))}
    </div>
  )
}
