
import { Button } from "@/components/ui/button"
import { UserPlus, User } from "lucide-react"

interface AssignmentButtonProps {
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  onClick: () => void
}

export const AssignmentButton = ({ currentAssignee, onClick }: AssignmentButtonProps) => {
  if (currentAssignee) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-auto p-0 text-left justify-start hover:bg-transparent"
        onClick={onClick}
      >
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span className="text-xs text-gray-600">{currentAssignee.name}</span>
        </div>
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-auto p-0 text-left justify-start hover:bg-blue-50 text-blue-600"
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <UserPlus className="h-3 w-3" />
        <span className="text-xs">Atribuir agente</span>
      </div>
    </Button>
  )
}
