
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { ConversationPageHeader } from "@/components/ConversationPageHeader"
import { ConversationPageFilters } from "@/components/ConversationPageFilters"
import { ConversationEmptyState } from "@/components/ConversationEmptyState"
import { useConversations, useUsers, useInboxes } from "@/hooks/useSupabaseData"
import { Conversation, ConversationForStats } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export default function Conversations() {
  const [accountId, setAccountId] = useState("")
  const [status, setStatus] = useState("all")
  const [assigneeId, setAssigneeId] = useState("all")
  const [inboxId, setInboxId] = useState("all")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // Buscar dados do usuário atual
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
        toast({
          title: "Erro ao carregar dados do usuário",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setCurrentUser(userData)
      
      // Para admin e agent, definir automaticamente o account_id
      if (userData.role === 'admin' || userData.role === 'agent') {
        setAccountId(userData.account_id.toString())
      }
    }

    fetchCurrentUser()
  }, [authUser, toast])

  const accountIdNumber = accountId ? parseInt(accountId) : 0

  // Build filters object
  const filters = {
    account_id: accountIdNumber,
    ...(status !== "all" && { status }),
    ...(assigneeId !== "all" && assigneeId !== "unassigned" && { assignee_id: assigneeId }),
    ...(inboxId !== "all" && { inbox_id: parseInt(inboxId) }),
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

  const filteredConversations = conversations.filter((conversation: Conversation) => {
    if (assigneeId === "unassigned") {
      return !conversation.assignee
    }
    return true
  })

  // Convert to ConversationForStats format for the stats component
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

  if (!currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-6">
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando dados do usuário...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-6">
            <ConversationPageHeader 
              onRefresh={handleRefresh}
              isLoading={conversationsLoading}
            />

            <ConversationPageFilters
              accountId={accountId}
              onAccountIdChange={setAccountId}
              status={status}
              onStatusChange={setStatus}
              assigneeId={assigneeId}
              onAssigneeIdChange={setAssigneeId}
              inboxId={inboxId}
              onInboxIdChange={setInboxId}
              agents={agents}
              inboxes={inboxes}
              currentUser={currentUser}
              agentsLoading={agentsLoading}
              inboxesLoading={inboxesLoading}
            />

            {accountIdNumber > 0 ? (
              <div className="space-y-6">
                <ConversationStats
                  conversations={conversationsForStats}
                  isLoading={conversationsLoading}
                />
                
                <ConversationManagement
                  accountId={accountIdNumber}
                  selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
                />
              </div>
            ) : (
              <ConversationEmptyState currentUser={currentUser} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
