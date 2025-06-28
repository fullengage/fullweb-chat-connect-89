
import { Button } from "@/components/ui/button"
import { UserPlus, User } from "lucide-react"
import { forwardRef } from "react"

interface AssignmentButtonProps {
  currentAssignee?: {
    id: string
    name: string
    avatar_url?: string
  }
  onClick: () => void
}

export const AssignmentButton = forwardRef<HTMLButtonElement, AssignmentButtonProps>(
  ({ currentAssignee, onClick }, ref) => {
  if (currentAssignee) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className="h-auto p-2 text-left justify-start hover:bg-gray-50 border border-gray-200 rounded-lg"
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentAssignee.name}
            </p>
            <p className="text-xs text-gray-500">
              Agente responsável
            </p>
          </div>
        </div>
      </Button>
    )
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className="h-auto p-2 text-left justify-start hover:bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:text-blue-700"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <UserPlus className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            Atribuir agente
          </p>
          <p className="text-xs opacity-75">
            Clique para atribuir
          </p>
        </div>
      </div>
    </Button>
  )
})

AssignmentButton.displayName = "AssignmentButton"
