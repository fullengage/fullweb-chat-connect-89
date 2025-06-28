
import { ConversationAssignmentDialog } from "./ConversationAssignmentDialog"
import { User as UserType } from "@/hooks/useSupabaseData"

interface ConversationAssignmentProps {
  conversationId: number
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  agents: UserType[]
  onAssignmentChange?: () => void
}

export const ConversationAssignment = ({
  conversationId,
  currentAssignee,
  agents,
  onAssignmentChange
}: ConversationAssignmentProps) => {
  return (
    <ConversationAssignmentDialog
      conversationId={conversationId}
      currentAssignee={currentAssignee}
      agents={agents}
      onAssignmentChange={onAssignmentChange}
    />
  )
}
