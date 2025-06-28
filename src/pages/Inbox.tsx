
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
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  
  const { user: authUser } = useAuth()
  const { toast } = useToast()

  // ✅ Fetch current user data com tratamento de erro
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser) {
        setUserLoading(false)
        return
      }

      try {
        setUserLoading(true)
        setUserError(null)
        
        console.log('🔍 Fetching current user data for:', authUser.id)

        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single()

        if (error) {
          console.error('❌ Error fetching user data:', error)
          setUserError('Erro ao carregar dados do usuário')
          
          toast({
            title: "Erro ao carregar usuário",
            description: "Não foi possível carregar seus dados. Tente recarregar a página.",
            variant: "destructive",
          })
          return
        }

        if (!userData) {
          console.error('❌ No user data found')
          setUserError('Usuário não encontrado')
          return
        }

        console.log('✅ Current user data loaded:', { 
          id: userData.id, 
          name: userData.name, 
          role: userData.role,
          account_id: userData.account_id
        })
        
        setCurrentUser(userData)
        
      } catch (error: any) {
        console.error('❌ Exception fetching user data:', error)
        setUserError('Erro inesperado ao carregar usuário')
        
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar seus dados.",
          variant: "destructive",
        })
      } finally {
        setUserLoading(false)
      }
    }

    fetchCurrentUser()
  }, [authUser, toast])

  // ✅ Build filters for conversations with validation
  const filters = {
    account_id: currentUser?.account_id || 0,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter === "mine" && { assignee_id: currentUser?.id }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "mine" && { assignee_id: assigneeFilter }),
  }

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations(filters)

  const {
    data: agents = [],
    isLoading: agentsLoading,
    error: agentsError
  } = useUsers(currentUser?.account_id || 0)

  // ✅ Filter conversations based on search with validation
  const filteredConversations = conversations.filter(conversation => {
    if (!conversation || typeof conversation !== 'object') return false
    
    const searchLower = searchTerm.toLowerCase()
    const contactName = conversation.contact?.name?.toLowerCase() || ''
    const contactEmail = conversation.contact?.email?.toLowerCase() || ''
    
    return contactName.includes(searchLower) || contactEmail.includes(searchLower)
  })

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    if (!conversation || !conversation.id) {
      console.warn('⚠️ Invalid conversation selected:', conversation)
      return
    }
    
    console.log('✅ Selecting conversation:', conversation.id)
    setSelectedConversation(conversation)
    setShowDetailsPanel(false) // Hide details panel on mobile/tablet
  }

  // Handle details panel toggle
  const toggleDetailsPanel = () => {
    setShowDetailsPanel(!showDetailsPanel)
  }

  // ✅ Loading state específico por seção
  if (userLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados do usuário...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // ✅ Error state para usuário
  if (userError || !currentUser) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <div className="text-red-500 text-2xl">❌</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Erro ao carregar usuário
              </h3>
              <p className="text-gray-500 mb-4">
                {userError || 'Não foi possível carregar seus dados.'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Recarregar página
              </button>
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
