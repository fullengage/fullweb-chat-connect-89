
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Star, MessageCircle, Clock, CheckCircle, User } from "lucide-react"
import { Conversation } from "@/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConversationsSidebarProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  assigneeFilter: string
  onAssigneeFilterChange: (assignee: string) => void
  agents: any[]
  isLoading: boolean
  currentUser: any
}

export const ConversationsSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  agents,
  isLoading,
  currentUser
}: ConversationsSidebarProps) => {
  const [showFilters, setShowFilters] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageCircle className="h-3 w-3 text-green-500" />
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-3 w-3 text-gray-500" />
      default:
        return <MessageCircle className="h-3 w-3 text-blue-500" />
    }
  }

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

  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "Sem mensagens"
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage.content?.substring(0, 50) + (lastMessage.content && lastMessage.content.length > 50 ? '...' : '')
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unread_count || 0
  }

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversa ou contato..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { key: 'all', label: 'Todas', icon: MessageCircle },
            { key: 'open', label: 'Abertas', icon: MessageCircle },
            { key: 'mine', label: 'Minhas', icon: User },
            { key: 'resolved', label: 'Resolvidas', icon: CheckCircle },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key || (filter.key === 'mine' && assigneeFilter === 'mine') ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (filter.key === 'mine') {
                  onAssigneeFilterChange('mine')
                  onStatusFilterChange('all')
                } else {
                  onStatusFilterChange(filter.key)
                  onAssigneeFilterChange('all')
                }
              }}
              className="text-xs"
            >
              <filter.icon className="h-3 w-3 mr-1" />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedConversation?.id === conversation.id && "bg-blue-50 border-r-2 border-blue-500"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.contact?.avatar_url} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {conversation.contact?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Channel indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-2 w-2 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.contact?.name || 'Contato Desconhecido'}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(conversation.status)}
                        {getUnreadCount(conversation) > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                            {getUnreadCount(conversation)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-1">
                      {getLastMessage(conversation)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs px-2 py-0.5", getStatusColor(conversation.status))}>
                          {conversation.status === 'open' ? 'Aberta' : 
                           conversation.status === 'pending' ? 'Pendente' : 'Resolvida'}
                        </Badge>
                        
                        {conversation.assignee && (
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={conversation.assignee.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {conversation.assignee.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 truncate max-w-20">
                              {conversation.assignee.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.updated_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
