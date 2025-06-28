
import { 
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet"
import { Conversation } from "@/types"
import { ConversationDetailHeader } from "./ConversationDetailHeader"
import { ConversationContactInfo } from "./ConversationContactInfo"

import { ConversationMessages } from "./ConversationMessages"

interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
}

interface ConversationDetailProps {
  conversation: Conversation | null
  agents: Agent[]
  isOpen: boolean
  onClose: () => void
}

export const ConversationDetail = ({ 
  conversation, 
  agents, 
  isOpen, 
  onClose 
}: ConversationDetailProps) => {
  if (!conversation) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <ConversationDetailHeader conversation={conversation} />
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          <ConversationContactInfo conversation={conversation} />
          
          

          <ConversationMessages conversation={conversation} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
