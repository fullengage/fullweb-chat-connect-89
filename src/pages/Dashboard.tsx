
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useConversations, useUsers, useInboxes, useUpdateConversationStatus } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"
import { ConversationForStats, Conversation } from "@/types"
import { ChatArea } from "@/components/inbox/ChatArea"
import { ConversationsSidebar } from "@/components/inbox/ConversationsSidebar"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"

export default function Dashboard() {
  const [accountId, setAccountId] = useState("1")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const accountIdNumber = accountId ? parseInt(accountId) : 1

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

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            {/* Conversations Sidebar */}
            <ConversationsSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              isLoading={conversationsLoading}
              onRefresh={handleRefresh}
            />

            {/* Main Chat Area */}
            <ChatArea
              conversation={selectedConversation}
              currentUser={currentUser}
              agents={agents}
              onToggleDetails={handleToggleDetails}
              showDetailsPanel={showDetailsPanel}
              onRefreshConversations={refetchConversations}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
