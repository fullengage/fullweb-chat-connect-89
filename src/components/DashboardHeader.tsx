
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export const DashboardHeader = ({ onRefresh, isLoading }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Atendimento ao Cliente</h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas em tempo real
          </p>
        </div>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  )
}
