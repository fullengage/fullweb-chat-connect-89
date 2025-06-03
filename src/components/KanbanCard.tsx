
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, GripVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface Conversation {
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
    id: number
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

interface KanbanCardProps {
  id: string
  conversation: Conversation
  onClick?: () => void
  isDragging?: boolean
}

export const KanbanCard = ({ id, conversation, onClick, isDragging }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'Channel::WebWidget':
        return '💬'
      case 'Channel::Email':
        return '📧'
      case 'Channel::FacebookPage':
        return '📘'
      case 'Channel::TwitterProfile':
        return '🐦'
      case 'Channel::TwilioSms':
        return '📱'
      default:
        return '💬'
    }
  }

  const lastMessage = conversation.messages?.[conversation.messages.length - 1]

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 bg-white ${
        isSortableDragging || isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={conversation.contact.avatar_url} />
              <AvatarFallback className="text-xs">
                {conversation.contact.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">
                {conversation.contact.name || 'Contato Desconhecido'}
              </h4>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{getChannelIcon(conversation.inbox.channel_type)}</span>
                <span className="text-xs text-gray-500 truncate">
                  {conversation.inbox.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {conversation.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs h-5">
                {conversation.unread_count}
              </Badge>
            )}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>

        {lastMessage && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {lastMessage.content || 'Nenhum conteúdo da mensagem'}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {conversation.assignee ? (
              <div className="flex items-center space-x-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={conversation.assignee.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {conversation.assignee.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500 truncate max-w-20">
                  {conversation.assignee.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">Não atribuído</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
