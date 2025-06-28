
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Clock,
  User,
  AlertCircle,
  MoreHorizontal,
  History,
  UserCircle
} from "lucide-react"
import { Conversation } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConversationCardProps {
  conversation: Conversation
  onOpenHistory: (conversation: Conversation) => void
}

export const ConversationCard = ({ conversation, onOpenHistory }: ConversationCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar 
              className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => onOpenHistory(conversation)}
            >
              <AvatarImage src={conversation.contact?.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {conversation.contact?.name?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 
                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onOpenHistory(conversation)}
                >
                  {conversation.contact?.name || 'Contato Desconhecido'}
                </h3>
                <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                  {getStatusText(conversation.status)}
                </Badge>
              </div>
              
              {conversation.contact?.email && (
                <p className="text-sm text-gray-600 mb-2">
                  {conversation.contact.email}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(conversation.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  {conversation.assignee ? (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{conversation.assignee.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Sem agente</span>
                    </div>
                  )}
                </div>
                
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpenHistory(conversation)}>
                <History className="h-4 w-4 mr-2" />
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenHistory(conversation)}>
                <UserCircle className="h-4 w-4 mr-2" />
                Dados do Cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
