
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { InboxManagement } from "@/components/InboxManagement"
import { ConversationManagement } from "@/components/ConversationManagement"
import { useChatwootConversations, useChatwootAgents, useChatwootInboxes } from "@/hooks/useChatwootData"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Inbox, MessageSquare, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Kanban } from "lucide-react"

export default function Dashboard() {
  const [accountId, setAccountId] = useState("")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 0

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
    ...(status !== "all" && { status }),
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: parseInt(assigneeId) }),
    ...(inboxId !== "all" && { inbox_id: parseInt(inboxId) }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useChatwootConversations(filters)

  const {
    data: agents = [],
    isLoading: agentsLoading
  } = useChatwootAgents(accountIdNumber)

  const {
    data: inboxes = [],
    isLoading: inboxesLoading
  } = useChatwootInboxes(accountIdNumber)

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  const handleStatusChange = (conversationId: number, newStatus: string) => {
    // Aqui seria implementada a lógica para atualizar o status da conversa
    console.log(`Updating conversation ${conversationId} to status ${newStatus}`)
    toast({
      title: "Status atualizado",
      description: `Conversa movida para ${newStatus}`,
    })
    // Refetch conversations to get updated data
    refetchConversations()
  }

  const filteredConversations = conversations.filter(conversation => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee
    }
    return true
  })

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Painel de Atendimento ao Cliente</h1>
                  <p className="text-muted-foreground">
                    Gerencie suas conversas do Chatwoot em tempo real
                  </p>
                </div>
              </div>
              <Button onClick={handleRefresh} disabled={conversationsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            <ChatwootFilters
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
              isLoading={agentsLoading || inboxesLoading}
            />

            {accountIdNumber > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center space-x-2">
                    <Kanban className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="conversations" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Conversas</span>
                  </TabsTrigger>
                  <TabsTrigger value="inboxes" className="flex items-center space-x-2">
                    <Inbox className="h-4 w-4" />
                    <span>Caixas de Entrada</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <ConversationStats
                    conversations={filteredConversations}
                    isLoading={conversationsLoading}
                  />
                  
                  <ConversationManagement
                    accountId={accountIdNumber}
                    selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                  />
                </TabsContent>

                <TabsContent value="kanban" className="space-y-6 mt-6">
                  <KanbanBoard
                    conversations={filteredConversations}
                    onConversationClick={(conversation) => {
                      // Aqui seria implementada a lógica para abrir detalhes da conversa
                      console.log('Opening conversation:', conversation.id)
                    }}
                    onStatusChange={handleStatusChange}
                    isLoading={conversationsLoading}
                  />
                </TabsContent>

                <TabsContent value="conversations" className="space-y-6 mt-6">
                  <ConversationManagement
                    accountId={accountIdNumber}
                    selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                  />
                </TabsContent>

                <TabsContent value="inboxes" className="space-y-6 mt-6">
                  <InboxManagement accountId={accountIdNumber} />
                </TabsContent>
              </Tabs>
            )}

            {accountIdNumber === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Digite um ID de conta para começar
                </h3>
                <p className="text-gray-500">
                  Informe o ID da sua conta Chatwoot nos filtros acima para visualizar suas conversas
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
