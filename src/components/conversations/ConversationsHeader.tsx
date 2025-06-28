
import { Button } from "@/components/ui/button"
import { MessageSquare, RefreshCw } from "lucide-react"

interface ConversationsHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export const ConversationsHeader = ({ onRefresh, isLoading }: ConversationsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <span>Conversas</span>
        </h1>
        <p className="text-muted-foreground">
          Gerencie todas as suas conversas em um só lugar
        </p>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  )
}
