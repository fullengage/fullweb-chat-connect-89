
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useConversations, useUsers, useInboxes, useUpdateConversationStatus } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"
import { ConversationForStats, Conversation } from "@/types"
import { ChatArea } from "@/components/inbox/ChatArea"
import { ConversationsSidebar } from "@/components/inbox/ConversationsSidebar"
import { usePermissions } from "@/hooks/useNewAuth"
import { RoleGuard } from "@/components/RoleGuard"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

export default function Dashboard() {
  const [accountId, setAccountId] = useState("1")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const { toast } = useToast()
  const { profile, isClient, isAgent, isAdmin, isSuperAdmin } = usePermissions()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

  // Para clientes, usar um account_id específico ou baseado no usuário
  const effectiveAccountId = isClient() && profile ? profile.account_id : accountIdNumber

  // Build filters object
  const filters = {
    account_id: effectiveAccountId,
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
  } = useUsers(effectiveAccountId)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useInboxes(effectiveAccountId)

  const updateStatus = useUpdateConversationStatus()

  // Para clientes, filtrar apenas conversas onde ele é o contato
  const filteredConversations = conversations.filter(conversation => {
    // Se for cliente, mostrar apenas suas próprias conversas
    if (isClient() && profile) {
      // Aqui você precisaria de uma lógica para identificar se a conversa pertence ao cliente
      // Por exemplo, se o cliente tem um contact_id específico
      // return conversation.contact_id === profile.contact_id
    }

    // Para outros papéis, aplicar filtros normais
    const matchesSearch = !searchTerm || 
      conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter

    // Para agentes, filtrar apenas conversas atribuídas a eles
    if (isAgent() && profile) {
      const matchesAssignee = assigneeFilter === "all" || 
        (assigneeFilter === "mine" && conversation.assignee?.id === profile.id) ||
        (assigneeFilter === "unassigned" && !conversation.assignee?.id) ||
        conversation.assignee?.id === assigneeFilter
        
      // Agentes só veem conversas atribuídas a eles ou não atribuídas da sua conta
      return matchesSearch && matchesStatus && 
        (conversation.assignee?.id === profile.id || !conversation.assignee?.id)
    }

    // Para admins e superadmins
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "mine" && conversation.assignee?.id === profile?.id) ||
      (assigneeFilter === "unassigned" && !conversation.assignee?.id) ||
      conversation.assignee?.id === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleToggleDetails = () => {
    setShowDetailsPanel(!showDetailsPanel)
  }

  if (!profile) {
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

  return (
    <RoleGuard allowedRoles={['superadmin', 'admin', 'agent', 'cliente']}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-screen">
              {/* Conversations Sidebar */}
              <ConversationsSidebar
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                assigneeFilter={assigneeFilter}
                onAssigneeFilterChange={setAssigneeFilter}
                agents={agents}
                isLoading={conversationsLoading}
                currentUser={profile}
              />

              {/* Main Chat Area */}
              <ChatArea
                conversation={selectedConversation}
                currentUser={profile}
                agents={agents}
                onToggleDetails={handleToggleDetails}
                showDetailsPanel={showDetailsPanel}
                onRefreshConversations={refetchConversations}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleGuard>
  )
}
