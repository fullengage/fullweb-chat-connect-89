
import { Button } from "@/components/ui/button"
import { RefreshCw, MessageSquare } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface ConversationPageHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export const ConversationPageHeader = ({ onRefresh, isLoading }: ConversationPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span>Conversas</span>
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas conversas em um só lugar
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  )
}
