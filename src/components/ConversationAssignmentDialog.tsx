
import { 
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User } from "lucide-react"
import { AssignmentButton } from "./AssignmentButton"
import { AssignmentDialogContent } from "./AssignmentDialogContent"
import { useConversationAssignment } from "@/hooks/useConversationAssignment"
import { User as UserType } from "@/hooks/useSupabaseData"

interface ConversationAssignmentDialogProps {
  conversationId: number
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  agents: UserType[]
  onAssignmentChange?: () => void
}

export const ConversationAssignmentDialog = ({
  conversationId,
  currentAssignee,
  agents,
  onAssignmentChange
}: ConversationAssignmentDialogProps) => {
  const {
    isOpen,
    setIsOpen,
    selectedAgentId,
    setSelectedAgentId,
    isAssigning,
    handleAssign,
    handleUnassign,
    filterValidAgents
  } = useConversationAssignment({
    conversationId,
    onAssignmentChange
  })

  const validAgents = filterValidAgents(agents)

  console.log('ConversationAssignmentDialog props:', { conversationId, currentAssignee, agents: agents?.length })
  console.log('Raw agents data:', agents)
  console.log('Valid agents after filtering:', validAgents.length, validAgents)

  if (!validAgents || validAgents.length === 0) {
    console.log('No valid agents available')
    return (
      <div className="flex items-center space-x-2">
        <User className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-400">Nenhum agente disponível</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AssignmentButton 
          currentAssignee={currentAssignee}
          onClick={() => setIsOpen(true)}
        />
      </DialogTrigger>
      
      <AssignmentDialogContent
        currentAssignee={currentAssignee}
        selectedAgentId={selectedAgentId}
        onSelectedAgentIdChange={setSelectedAgentId}
        validAgents={validAgents}
        isAssigning={isAssigning}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        onClose={() => setIsOpen(false)}
      />
    </Dialog>
  )
}
