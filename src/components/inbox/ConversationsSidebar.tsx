
import { useState } from "react"
import { Search, Filter, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Conversation } from "@/types"
import { ConversationCard } from "@/components/ConversationCard"
import { User } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"

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
  agents: User[]
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

  // ✅ Handler para seleção de conversa com validação
  const handleSelectConversation = (conversation: Conversation) => {
    // Verificar se conversa tem agente atribuído
    const hasAssignedAgent = conversation.assignee && conversation.assignee.id
    
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

  const getStatusStats = () => {
    const stats = {
      total: conversations.length,
      open: conversations.filter(c => c.status === 'open').length,
      pending: conversations.filter(c => c.status === 'pending').length,
      resolved: conversations.filter(c => c.status === 'resolved').length,
      unassigned: conversations.filter(c => !c.assignee?.id).length
    }
    return stats
  }

  const stats = getStatusStats()

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-3 p-3 border rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Conversas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-sm font-medium text-red-900">{stats.unassigned}</div>
            <div className="text-xs text-red-600">Não atribuídas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Responsável</label>
              <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="mine">Minhas conversas</SelectItem>
                  <SelectItem value="unassigned">Não atribuídas</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-4">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => {
              const hasAssignedAgent = conversation.assignee && conversation.assignee.id
              const isSelected = selectedConversation?.id === conversation.id
              
              return (
                <div
                  key={conversation.id}
                  className={`mb-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : hasAssignedAgent
                      ? 'hover:bg-gray-50'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <ConversationCard 
                    conversation={conversation} 
                    onClick={() => handleSelectConversation(conversation)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer com estatísticas */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{stats.total - stats.unassigned} atribuídas</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{stats.unassigned} bloqueadas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
