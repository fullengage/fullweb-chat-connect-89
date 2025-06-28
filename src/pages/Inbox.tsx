
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ConversationsSidebar } from "@/components/inbox/ConversationsSidebar"
import { ChatArea } from "@/components/inbox/ChatArea"
import { DetailsPanel } from "@/components/inbox/DetailsPanel"
import { useConversations, useUsers } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Conversation } from "@/types"

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const { user: authUser } = useAuth()
  const { toast } = useToast()

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

  // Build filters for conversations
  const filters = {
    account_id: currentUser?.account_id || 0,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter === "mine" && { assignee_id: currentUser?.id }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "mine" && { assignee_id: assigneeFilter }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useConversations(filters)

  const {
    data: agents = [],
  } = useUsers(currentUser?.account_id || 0)

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    conversation.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowDetailsPanel(false) // Hide details panel on mobile/tablet
  }

  // Handle details panel toggle
  const toggleDetailsPanel = () => {
    setShowDetailsPanel(!showDetailsPanel)
  }

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            {/* Conversations Sidebar */}
            <ConversationsSidebar
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              agents={agents}
              isLoading={conversationsLoading}
              currentUser={currentUser}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex">
              <ChatArea
                conversation={selectedConversation}
                currentUser={currentUser}
                agents={agents}
                onToggleDetails={toggleDetailsPanel}
                showDetailsPanel={showDetailsPanel}
                onRefreshConversations={refetchConversations}
              />

              {/* Details Panel */}
              {showDetailsPanel && selectedConversation && (
                <DetailsPanel
                  conversation={selectedConversation}
                  agents={agents}
                  onClose={() => setShowDetailsPanel(false)}
                  onRefreshConversations={refetchConversations}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
