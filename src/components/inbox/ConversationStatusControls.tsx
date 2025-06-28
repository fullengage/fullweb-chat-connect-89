
import { Badge } from "@/components/ui/badge"
import { Conversation } from "@/types"

interface ConversationStatusControlsProps {
  conversation: Conversation
  agents: any[]
  onRefreshConversations: () => void
}

export const ConversationStatusControls = ({
  conversation,
}: ConversationStatusControlsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta'
      case 'pending':
        return 'Pendente'
      case 'resolved':
        return 'Resolvida'
      default:
        return status
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Badge className={`${getStatusColor(conversation.status)} border-0`}>
        {getStatusText(conversation.status)}
      </Badge>
    </div>
  )
}
