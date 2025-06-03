
import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { useChatwootConversations, useChatwootAgents, useChatwootInboxes } from "@/hooks/useChatwootData"
import { Button } from "@/components/ui/button"
import { RefreshCw, MessageSquare, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Conversations() {
  const [accountId, setAccountId] = useState("")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
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
      title: "Atualizando conversas",
      description: "Buscando as conversas mais recentes...",
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
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <span>Conversas</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie todas as suas conversas do Chatwoot em um só lugar
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} disabled={conversationsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
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
              <div className="space-y-6">
                <ConversationStats
                  conversations={filteredConversations}
                  isLoading={conversationsLoading}
                />
                
                <ConversationManagement
                  accountId={accountIdNumber}
                  selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Configure sua conta Chatwoot
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Para visualizar suas conversas, primeiro configure o ID da sua conta Chatwoot nos filtros acima.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Como encontrar o ID da conta:
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Acesse seu painel Chatwoot</li>
                      <li>2. Verifique a URL: app.chatwoot.com/app/accounts/<strong>[ID]</strong></li>
                      <li>3. O número após "accounts/" é o ID da sua conta</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
