
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  CheckCircle,
  AlertCircle,
  Pause
} from "lucide-react"
import { Conversation } from "@/types"
import { ConversationCard } from "./ConversationCard"

interface ConversationsListProps {
  conversations: Conversation[]
  isLoading: boolean
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onOpenHistory: (conversation: Conversation) => void
  stats: {
    total: number
    open: number
    pending: number
    resolved: number
  }
}

export const ConversationsList = ({
  conversations,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onOpenHistory,
  stats
}: ConversationsListProps) => {
  const getConversationsByStatus = (status: string) => {
    if (status === "all") return conversations
    return conversations.filter(conv => conv.status === status)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Conversas</span>
          <Badge variant="outline">{conversations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={statusFilter} onValueChange={onStatusFilterChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Todas ({stats.total})</span>
            </TabsTrigger>
            <TabsTrigger value="open" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Abertas ({stats.open})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Pause className="h-4 w-4" />
              <span>Pendentes ({stats.pending})</span>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Resolvidas ({stats.resolved})</span>
            </TabsTrigger>
          </TabsList>

          {["all", "open", "pending", "resolved"].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : getConversationsByStatus(status).length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma conversa encontrada
                  </h3>
                  <p className="text-gray-500">
                    Suas conversas aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getConversationsByStatus(status).map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      onOpenHistory={onOpenHistory}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
