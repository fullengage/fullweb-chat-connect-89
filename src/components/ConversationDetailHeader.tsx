
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Conversation } from "@/types"

interface ConversationDetailHeaderProps {
  conversation: Conversation
}

export const ConversationDetailHeader = ({ conversation }: ConversationDetailHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.contact?.avatar_url} />
          <AvatarFallback>
            {conversation.contact?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <SheetTitle>{conversation.contact?.name || 'Contato Desconhecido'}</SheetTitle>
          <SheetDescription>
            Conversa #{conversation.id} • {conversation.inbox.name}
          </SheetDescription>
        </div>
      </div>
      <Badge className={getStatusColor(conversation.status)}>
        {getStatusText(conversation.status)}
      </Badge>
    </div>
  )
}
