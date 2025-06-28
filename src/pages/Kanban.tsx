
import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { KanbanBoard } from "@/components/KanbanBoard"
import { useConversations, useUsers, useUpdateConversationStatus } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ConversationForStats } from "@/types"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function Kanban() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  const accountIdNumber = currentUser?.account_id || 1

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
    data: users = [],
    isLoading: usersLoading
  } = useUsers(accountIdNumber)

  const updateStatus = useUpdateConversationStatus()

  const handleStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        conversationId: conversationId,
        status: newStatus
      })
      
      // Refresh conversations to get updated data
      refetchConversations()
      
      toast({
        title: "Status atualizado",
        description: `Conversa atualizada para ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating conversation status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conversa.",
        variant: "destructive",
      })
    }
  }

  const handleConversationClick = (conversation: ConversationForStats) => {
    console.log('Opening conversation:', conversation.id)
    // You can implement navigation to conversation detail here
  }

  const handleRefresh = () => {
    refetchConversations()
    toast({
      title: "Atualizando dados",
      description: "Buscando as informações mais recentes...",
    })
  }

  // Transform Conversation[] to ConversationForStats[]
  const conversationsForStats: ConversationForStats[] = conversations.map(conversation => ({
    ...conversation,
    unread_count: conversation.unread_count || 0, // Ensure unread_count is always a number
    contact: conversation.contact || {
      id: 0,
      name: 'Unknown Contact',
      email: '',
      phone: '',
      avatar_url: ''
    },
    assignee: conversation.assignee ? {
      id: conversation.assignee.id,
      name: conversation.assignee.name,
      avatar_url: conversation.assignee.avatar_url
    } : undefined,
    inbox: conversation.inbox || {
      id: 1,
      name: 'Chat Interno',
      channel_type: 'webchat'
    },
    updated_at: conversation.updated_at || new Date().toISOString(),
    messages: conversation.messages || []
  }))

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
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h1 className="text-2xl font-bold">Kanban Board</h1>
                <p className="text-gray-600">Gerencie suas conversas visualmente</p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 p-6 overflow-auto">
              <KanbanBoard
                conversations={conversationsForStats}
                onConversationClick={handleConversationClick}
                onStatusChange={handleStatusChange}
                isLoading={conversationsLoading}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
