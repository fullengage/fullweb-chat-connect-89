
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ChatwootFilters } from "@/components/ChatwootFilters"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationCard } from "@/components/ConversationCard"
import { useChatwootConversations, useChatwootAgents, useChatwootInboxes } from "@/hooks/useChatwootData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
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
      title: "Refreshing data",
      description: "Fetching latest conversations...",
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
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Customer Service Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your Chatwoot conversations in real-time
                </p>
              </div>
              <Button onClick={handleRefresh} disabled={conversationsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
                Refresh
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
              <>
                <ConversationStats
                  conversations={filteredConversations}
                  isLoading={conversationsLoading}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Conversations</span>
                      {filteredConversations.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({filteredConversations.length} total)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {conversationsLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : conversationsError ? (
                      <div className="text-center py-8">
                        <p className="text-red-600 mb-2">Error loading conversations</p>
                        <Button onClick={handleRefresh} variant="outline">
                          Try Again
                        </Button>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {accountIdNumber === 0 
                            ? "Enter an account ID to view conversations" 
                            : "No conversations found with the current filters"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredConversations.map((conversation) => (
                          <ConversationCard
                            key={conversation.id}
                            conversation={conversation}
                            onClick={() => {
                              toast({
                                title: "Conversation Details",
                                description: `Opening conversation with ${conversation.contact.name}`,
                              })
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
