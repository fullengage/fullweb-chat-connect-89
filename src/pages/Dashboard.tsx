
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { DashboardHeader } from "@/components/DashboardHeader"
import { DashboardFilters } from "@/components/DashboardFilters"
import { DashboardTabs } from "@/components/DashboardTabs"
import { DashboardEmptyState } from "@/components/DashboardEmptyState"
import { useConversations, useUsers, useInboxes, useUpdateConversationStatus } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"
import { ConversationForStats, Conversation } from "@/types"

export default function Dashboard() {
  const [accountId, setAccountId] = useState("1")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
    ...(status !== "all" && { status }),
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: assigneeId }),
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

  const updateStatus = useUpdateConversationStatus()

  // ✅ Log de debug para Dashboard
  console.log('Dashboard - Raw agents data:', agents)
  console.log('Dashboard - agents.length:', agents?.length)

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleKanbanStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ conversationId, status: newStatus })
      
      // Atualizar dados para refletir mudança
      refetchConversations()
      
      toast({
        title: "Status atualizado",
        description: `Conversa movida para ${newStatus}`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conversa",
        variant: "destructive",
      })
    }
  }

  const filteredConversations = conversations.filter((conversation: Conversation) => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee
    }
    return true
  })

  // Convert conversations to the format expected by components
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
      id: 1, // Mock inbox id since we don't have inbox_id in conversations table
      name: 'Inbox Padrão',
      channel_type: 'webchat'
    },
    updated_at: conv.updated_at,
    messages: conv.messages || []
  }))

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <DashboardHeader 
              onRefresh={handleRefresh}
              isLoading={conversationsLoading}
            />

            <DashboardFilters
              status={status}
              assigneeId={assigneeId}
              inboxId={inboxId}
              accountId={accountId}
              onStatusChange={setStatus}
              onAssigneeChange={setAssigneeId}
              onInboxChange={setInboxId}
              onAccountIdChange={setAccountId}
              agents={agents}
              inboxes={inboxes}
              agentsLoading={agentsLoading}
              inboxesLoading={inboxesLoading}
            />

            {accountIdNumber > 0 ? (
              <DashboardTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                accountId={accountIdNumber}
                inboxId={inboxId}
                conversationsForStats={conversationsForStats}
                conversationsLoading={conversationsLoading}
                onKanbanStatusChange={handleKanbanStatusChange}
              />
            ) : (
              <DashboardEmptyState />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
