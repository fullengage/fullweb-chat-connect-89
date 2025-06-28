
import { useState } from "react"
import { Search, Filter, Plus, MoreHorizontal, Clock, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Conversation } from "@/types"
import { User as UserType } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

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
  agents: UserType[]
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
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  const handleSelectConversation = (conversation: Conversation) => {
    const hasAssignedAgent = conversation.assignee && conversation.assignee.id
    
    // ✅ Para agentes, não mostrar mais o bloqueio - eles só veem conversas atribuídas a eles
    if (currentUser?.role === 'agent') {
      onSelectConversation(conversation)
      return
    }
    
    // Para admins/superadmins, manter a verificação de agente atribuído
    if (!hasAssignedAgent) {
      toast({
        title: "Conversa bloqueada",
        description: "Esta conversa precisa ter um agente atribuído antes de ser aberta.",
        variant: "destructive",
      })
      return
    }
    
    onSelectConversation(conversation)
  }

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

  const getConversationPreview = (conversation: Conversation) => {
    // Se tiver mensagens, pega a última
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      return lastMessage.content || 'Nova mensagem'
    }
    return 'Nova conversa'
  }

  const stats = {
    total: conversations.length,
    open: conversations.filter(c => c.status === 'open').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    unassigned: conversations.filter(c => !c.assignee?.id).length
  }

  // ✅ Título dinâmico baseado no papel do usuário
  const getHeaderTitle = () => {
    if (currentUser?.role === 'agent') {
      return 'Minhas Conversas'
    }
    return 'Conversas'
  }

  const getEmptyStateMessage = () => {
    if (currentUser?.role === 'agent') {
      return {
        title: 'Nenhuma conversa atribuída',
        description: 'Você não tem conversas atribuídas no momento'
      }
    }
    return {
      title: 'Nenhuma conversa encontrada',
      description: searchTerm ? 'Tente ajustar os filtros de busca' : 'Suas conversas aparecerão aqui'
    }
  }

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg p-3 animate-pulse">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{getHeaderTitle()}</h1>
          <div className="flex items-center space-x-2">
            {/* ✅ Só mostrar filtros para admins/superadmins */}
            {currentUser?.role !== 'agent' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 w-8 p-0"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-900">{stats.total}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-900">{stats.open}</div>
            <div className="text-xs text-green-600">Abertas</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-lg font-bold text-yellow-900">{stats.pending}</div>
            <div className="text-xs text-yellow-600">Pendentes</div>
          </div>
          {/* ✅ Para agentes, mostrar "Resolvidas" ao invés de "Sem agente" */}
          <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-lg font-bold text-gray-900">
              {currentUser?.role === 'agent' ? stats.resolved : stats.unassigned}
            </div>
            <div className="text-xs text-gray-600">
              {currentUser?.role === 'agent' ? 'Resolvidas' : 'Sem agente'}
            </div>
          </div>
        </div>

        {/* Filters - Só para admins/superadmins */}
        {showFilters && currentUser?.role !== 'agent' && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Abertas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Agente</label>
              <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos os agentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os agentes</SelectItem>
                  <SelectItem value="mine">Minhas conversas</SelectItem>
                  <SelectItem value="unassigned">Não atribuídas</SelectItem>
                  {agents.filter(agent => agent.id && agent.name).map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">
              {getEmptyStateMessage().title}
            </h3>
            <p className="text-sm text-gray-500">
              {getEmptyStateMessage().description}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const hasAssignedAgent = conversation.assignee && conversation.assignee.id
              const isSelected = selectedConversation?.id === conversation.id
              const preview = getConversationPreview(conversation)
              
              // ✅ Para agentes, não mostrar indicador de bloqueio
              const isBlocked = currentUser?.role !== 'agent' && !hasAssignedAgent
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-blue-50 border-r-4 border-blue-500'
                      : isBlocked
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  {/* Status Indicator - Só para conversas bloqueadas */}
                  {isBlocked && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conversation.contact?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {conversation.contact?.name?.charAt(0).toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.contact?.name || 'Contato Desconhecido'}
                        </h3>
                        <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                          {getStatusText(conversation.status)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {preview}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(conversation.updated_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>

                      {/* Assignee Info - Só mostrar para admins/superadmins */}
                      {currentUser?.role !== 'agent' && (
                        <div className="mt-2 flex items-center space-x-2">
                          {hasAssignedAgent ? (
                            <>
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={conversation.assignee?.avatar_url} />
                                <AvatarFallback className="text-xs bg-green-100 text-green-700">
                                  {conversation.assignee?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-green-700 font-medium">
                                {conversation.assignee?.name}
                              </span>
                            </>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-600">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">Sem agente</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      {conversation.contact?.email && (
                        <div className="mt-1 text-xs text-gray-400">
                          {conversation.contact.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {conversations.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {conversations.length} conversas
            </span>
            {currentUser?.role !== 'agent' && (
              <div className="flex items-center space-x-4">
                <span className="text-green-600">
                  {stats.total - stats.unassigned} atribuídas
                </span>
                <span className="text-red-600">
                  {stats.unassigned} bloqueadas
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
