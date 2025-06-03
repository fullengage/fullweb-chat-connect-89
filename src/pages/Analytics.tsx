
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationAnalytics } from "@/components/ConversationAnalytics"
import { ResponseTimeAnalytics } from "@/components/ResponseTimeAnalytics"
import { AgentPerformanceAnalytics } from "@/components/AgentPerformanceAnalytics"
import { useChatwootConversations, useChatwootAgents, useChatwootInboxes } from "@/hooks/useChatwootData"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, BarChart3, Clock, Users, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Analytics() {
  const [accountId, setAccountId] = useState("")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [activeTab, setActiveTab] = useState("conversations")
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
      title: "Atualizando análises",
      description: "Buscando os dados mais recentes...",
    })
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
                  <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <span>Análises Avançadas</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Obtenha insights sobre o desempenho da sua equipe e métricas de conversas
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

            {accountIdNumber > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="conversations" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Estatísticas de Conversas</span>
                  </TabsTrigger>
                  <TabsTrigger value="response-time" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Tempo de Resposta</span>
                  </TabsTrigger>
                  <TabsTrigger value="agent-performance" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Desempenho dos Atendentes</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="conversations" className="space-y-6 mt-6">
                  <ConversationAnalytics
                    conversations={filteredConversations}
                    isLoading={conversationsLoading}
                    inboxes={inboxes}
                  />
                </TabsContent>

                <TabsContent value="response-time" className="space-y-6 mt-6">
                  <ResponseTimeAnalytics
                    conversations={filteredConversations}
                    isLoading={conversationsLoading}
                    agents={agents}
                  />
                </TabsContent>

                <TabsContent value="agent-performance" className="space-y-6 mt-6">
                  <AgentPerformanceAnalytics
                    conversations={filteredConversations}
                    agents={agents}
                    isLoading={conversationsLoading || agentsLoading}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Configure sua conta para ver análises
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Para visualizar as análises avançadas, primeiro configure o ID da sua conta Chatwoot nos filtros acima.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
