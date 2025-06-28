
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Conversation } from "@/types"
import { ConversationList } from "./ConversationList"

interface ConversationTabsProps {
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  conversations: Conversation[]
  onConversationClick: (conversation: Conversation) => void
}

export const ConversationTabs = ({
  statusFilter,
  onStatusFilterChange,
  conversations,
  onConversationClick
}: ConversationTabsProps) => {
  // Group conversations by status
  const conversationsByStatus = {
    open: conversations.filter((c: Conversation) => c.status === 'open'),
    pending: conversations.filter((c: Conversation) => c.status === 'pending'),
    resolved: conversations.filter((c: Conversation) => c.status === 'resolved'),
  }

  const getTabCount = (status: string) => {
    return conversationsByStatus[status as keyof typeof conversationsByStatus]?.length || 0
  }

  return (
    <Tabs value={statusFilter} onValueChange={onStatusFilterChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>Todas</span>
          <Badge variant="secondary" className="ml-1">
            {conversations.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="open" className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Abertas</span>
          <Badge variant="secondary" className="ml-1">
            {getTabCount('open')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Pendentes</span>
          <Badge variant="secondary" className="ml-1">
            {getTabCount('pending')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="resolved" className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Resolvidas</span>
          <Badge variant="secondary" className="ml-1">
            {getTabCount('resolved')}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <ConversationList 
          conversations={conversations}
          onConversationClick={onConversationClick}
        />
      </TabsContent>

      <TabsContent value="open" className="mt-4">
        <ConversationList 
          conversations={conversationsByStatus.open}
          onConversationClick={onConversationClick}
        />
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <ConversationList 
          conversations={conversationsByStatus.pending}
          onConversationClick={onConversationClick}
        />
      </TabsContent>

      <TabsContent value="resolved" className="mt-4">
        <ConversationList 
          conversations={conversationsByStatus.resolved}
          onConversationClick={onConversationClick}
        />
      </TabsContent>
    </Tabs>
  )
}
