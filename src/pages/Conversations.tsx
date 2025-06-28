import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Pause,
  MoreHorizontal,
  History,
  UserCircle
} from "lucide-react"
import { useConversations, useUsers, useInboxes } from "@/hooks/useSupabaseData"
import { Conversation, ConversationForStats } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationHistoryModal } from "@/components/ConversationHistoryModal"

export default function Conversations() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) return

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setCurrentUser(userData)
    }

    fetchCurrentUser()
  }, [authUser])

  const accountIdNumber = currentUser?.account_id || 1

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "unassigned" && { assignee_id: assigneeFilter }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(filters)

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useUsers(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useInboxes(accountIdNumber)

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando conversas",
      description: "Buscando as conversas mais recentes...",
    })
  }

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter((conversation: Conversation) => {
    const matchesSearch = !searchTerm || 
      conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter === "mine" && conversation.assignee?.id === currentUser?.id) ||
      (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && assigneeFilter !== "mine" && conversation.assignee?.id === assigneeFilter)

    return matchesSearch && matchesAssignee
  })

  // Convert to ConversationForStats format
  const conversationsForStats: ConversationForStats[] = filteredConversations.map((conv: Conversation) => ({
    id: conv.id,
    status: conv.status,
    unread_count: conv.unread_count || 0,
    contact: {
      id: conv.contact?.id || 0,
      name: conv.contact?.name || 'Contato Desconhecido',
      email: conv.contact?.email,
      phone: conv.contact?.phone,
      avatar_url: conv.contact?.avatar_url
    },
    assignee: conv.assignee ? {
      id: conv.assignee.id,
      name: conv.assignee.name,
      avatar_url: conv.assignee.avatar_url
    } : undefined,
    inbox: {
      id: conv.inbox?.id || 1,
      name: conv.inbox?.name || 'Inbox Padrão',
      channel_type: conv.inbox?.channel_type || 'webchat'
    },
    updated_at: conv.updated_at,
    messages: conv.messages || []
  }))

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Pause className="h-4 w-4" />
      case 'resolved':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getConversationsByStatus = (status: string) => {
    if (status === "all") return filteredConversations
    return filteredConversations.filter(conv => conv.status === status)
  }

  const stats = {
    total: filteredConversations.length,
    open: filteredConversations.filter(c => c.status === 'open').length,
    pending: filteredConversations.filter(c => c.status === 'pending').length,
    resolved: filteredConversations.filter(c => c.status === 'resolved').length,
    unassigned: filteredConversations.filter(c => !c.assignee?.id).length
  }

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  const handleOpenHistory = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowHistoryModal(true)
  }

  const handleCloseHistory = () => {
    setShowHistoryModal(false)
    setSelectedConversation(null)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <span>Conversas</span>
                </h1>
                <p className="text-muted-foreground">
                  Gerencie todas as suas conversas em um só lugar
                </p>
              </div>
              <Button onClick={handleRefresh} disabled={conversationsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar conversas por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="open">Abertas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.open}</div>
                  <div className="text-sm text-gray-600">Abertas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pendentes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.resolved}</div>
                  <div className="text-sm text-gray-600">Resolvidas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.unassigned}</div>
                  <div className="text-sm text-gray-600">Sem agente</div>
                </CardContent>
              </Card>
            </div>

            {/* Conversations by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversas</span>
                  <Badge variant="outline">{filteredConversations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Todas ({stats.total})</span>
                    </TabsTrigger>
                    <TabsTrigger value="open" className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Abertas ({stats.open})</span>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center space-x-2">
                      <Pause className="h-4 w-4" />
                      <span>Pendentes ({stats.pending})</span>
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Resolvidas ({stats.resolved})</span>
                    </TabsTrigger>
                  </TabsList>

                  {["all", "open", "pending", "resolved"].map((status) => (
                    <TabsContent key={status} value={status} className="mt-6">
                      {conversationsLoading ? (
                        <div className="space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-4 animate-pulse">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : getConversationsByStatus(status).length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhuma conversa encontrada
                          </h3>
                          <p className="text-gray-500">
                            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Suas conversas aparecerão aqui'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getConversationsByStatus(status).map((conversation) => (
                            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-4 flex-1">
                                    <Avatar 
                                      className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                      onClick={() => handleOpenHistory(conversation)}
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
                                          onClick={() => handleOpenHistory(conversation)}
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
                                      <DropdownMenuItem onClick={() => handleOpenHistory(conversation)}>
                                        <History className="h-4 w-4 mr-2" />
                                        Ver Histórico
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleOpenHistory(conversation)}>
                                        <UserCircle className="h-4 w-4 mr-2" />
                                        Dados do Cliente
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Analytics Section */}
            {conversationsForStats.length > 0 && (
              <ConversationStats
                conversations={conversationsForStats}
                isLoading={conversationsLoading}
              />
            )}
          </div>
        </SidebarInset>
      </div>

      {/* History Modal */}
      <ConversationHistoryModal
        conversation={selectedConversation}
        isOpen={showHistoryModal}
        onClose={handleCloseHistory}
      />
    </SidebarProvider>
  )
}
