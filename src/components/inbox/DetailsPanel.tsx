
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Conversation } from "@/types"
import { ContactInfoCard } from "./ContactInfoCard"
import { ConversationStatusControls } from "./ConversationStatusControls"
import { ConversationStatsCard } from "./ConversationStatsCard"

interface DetailsPanelProps {
  conversation: Conversation
  agents: any[]
  onClose: () => void
  onRefreshConversations: () => void
}

export const DetailsPanel = ({
  conversation,
  agents,
  onClose,
  onRefreshConversations
}: DetailsPanelProps) => {
  return (
    <div className="w-64 border-l bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Detalhes</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <ContactInfoCard conversation={conversation} />
        
        <div className="text-center">
          <ConversationStatusControls
            conversation={conversation}
            agents={agents}
            onRefreshConversations={onRefreshConversations}
          />
        </div>

        <ConversationStatsCard conversation={conversation} />
      </div>
    </div>
  )
}
