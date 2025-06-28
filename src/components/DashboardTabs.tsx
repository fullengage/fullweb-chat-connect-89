
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Inbox, MessageSquare, BarChart3, Kanban } from "lucide-react"
import { ConversationStats } from "@/components/ConversationStats"
import { ConversationManagement } from "@/components/ConversationManagement"
import { InboxManagement } from "@/components/InboxManagement"
import { KanbanBoard } from "@/components/KanbanBoard"
import { ConversationForStats } from "@/types"

interface DashboardTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  accountId: number
  inboxId: string
  conversationsForStats: ConversationForStats[]
  conversationsLoading: boolean
  onKanbanStatusChange: (conversationId: number, newStatus: string) => void
}

export const DashboardTabs = ({
  activeTab,
  onTabChange,
  accountId,
  inboxId,
  conversationsForStats,
  conversationsLoading,
  onKanbanStatusChange
}: DashboardTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Visão Geral</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center space-x-2">
          <Kanban className="h-4 w-4" />
          <span>Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="conversations" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Conversas</span>
        </TabsTrigger>
        <TabsTrigger value="inboxes" className="flex items-center space-x-2">
          <Inbox className="h-4 w-4" />
          <span>Caixas de Entrada</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-6">
        <ConversationStats
          conversations={conversationsForStats}
          isLoading={conversationsLoading}
        />
        
        <ConversationManagement
          accountId={accountId}
          selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
        />
      </TabsContent>

      <TabsContent value="kanban" className="space-y-6 mt-6">
        <KanbanBoard
          conversations={conversationsForStats}
          onConversationClick={(conversation) => {
            console.log('Opening conversation:', conversation.id)
          }}
          onStatusChange={onKanbanStatusChange}
          isLoading={conversationsLoading}
        />
      </TabsContent>

      <TabsContent value="conversations" className="space-y-6 mt-6">
        <ConversationManagement
          accountId={accountId}
          selectedInboxId={inboxId !== "all" ? parseInt(inboxId) : undefined}
        />
      </TabsContent>

      <TabsContent value="inboxes" className="space-y-6 mt-6">
        <InboxManagement accountId={accountId} />
      </TabsContent>
    </Tabs>
  )
}
