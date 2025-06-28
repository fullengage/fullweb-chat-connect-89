
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useConversations, useUsers, type User } from "@/hooks/useSupabaseData"
import { Conversation } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { ConversationDetail } from "./ConversationDetail"
import { ConversationFilters } from "./ConversationFilters"
import { ConversationTabs } from "./ConversationTabs"

interface ConversationManagementProps {
  accountId: number
  selectedInboxId?: number
}

// Define Agent type to match what ConversationDetail expects
interface LocalAgent {
  id: number
  name: string
  email: string
}

export const ConversationManagement = ({ 
  accountId, 
  selectedInboxId 
}: ConversationManagementProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Build filters object
  const filters = {
    account_id: accountId,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(assigneeFilter !== "all" && assigneeFilter !== "unassigned" && { assignee_id: assigneeFilter }),
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
  } = useUsers(accountId)

  // ✅ Log de debug para agentes
  console.log('ConversationManagement - Raw agents data:', agents)
  console.log('ConversationManagement - agents.length:', agents?.length)

  // Convert User[] to LocalAgent[] format expected by ConversationDetail
  const agentsForFilter: LocalAgent[] = agents
    .filter(user => {
      // ✅ Filtração rigorosa
      const isValid = user && 
                     user.id && 
                     typeof user.id === 'string' &&
                     user.id.trim() !== '' &&
                     user.name && 
                     user.name.trim() !== ''
      
      if (!isValid) {
        console.warn('ConversationManagement - Invalid agent filtered out:', user)
      }
      
      return isValid
    })
    .map((user: User, index: number) => ({
      id: index + 1, // Use index as number ID since ConversationDetail expects number
      name: user.name,
      email: user.email
    }))

  console.log('ConversationManagement - Valid agents for filter:', agentsForFilter)

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedConversation(null)
  }

  // Filter conversations based on search query and filters
  const filteredConversations = conversations.filter((conversation: Conversation) => {
    const matchesSearch = searchQuery === "" || 
      conversation.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !conversation.assignee) ||
      (assigneeFilter !== "unassigned" && conversation.assignee?.id === assigneeFilter)

    return matchesSearch && matchesAssignee
  })

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Gerenciar Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (conversationsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Gerenciar Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Erro ao carregar conversas</p>
            <Button onClick={() => refetchConversations()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Gerenciar Conversas</span>
              <Badge variant="outline">{filteredConversations.length} total</Badge>
            </CardTitle>
            
            <ConversationFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              assigneeFilter={assigneeFilter}
              onAssigneeFilterChange={setAssigneeFilter}
              agents={agents}
              onRefresh={refetchConversations}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <ConversationTabs
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            conversations={filteredConversations}
            onConversationClick={handleConversationClick}
          />
        </CardContent>
      </Card>

      <ConversationDetail
        conversation={selectedConversation}
        agents={agentsForFilter}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </>
  )
}
