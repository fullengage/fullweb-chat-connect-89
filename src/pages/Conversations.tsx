
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useConversations, useUsers } from "@/hooks/useSupabaseData"
import { Conversation, ConversationForStats } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationHistoryModal } from "@/components/ConversationHistoryModal"
import { ConversationsHeader } from "@/components/conversations/ConversationsHeader"
import { ConversationsFilters } from "@/components/conversations/ConversationsFilters"
import { ConversationsStats } from "@/components/conversations/ConversationsStats"
import { ConversationsList } from "@/components/conversations/ConversationsList"

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
            <ConversationsHeader 
              onRefresh={handleRefresh}
              isLoading={conversationsLoading}
            />

            <ConversationsFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              agents={agents}
            />

            <ConversationsStats stats={stats} />

            <ConversationsList
              conversations={filteredConversations}
              isLoading={conversationsLoading}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onOpenHistory={handleOpenHistory}
              stats={stats}
            />

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
