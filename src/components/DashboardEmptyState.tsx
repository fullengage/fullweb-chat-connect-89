
import { MessageSquare } from "lucide-react"

export const DashboardEmptyState = () => {
  return (
    <div className="text-center py-12">
      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Selecione uma conta para começar
      </h3>
      <p className="text-gray-500">
        Selecione uma conta nos filtros acima para visualizar suas conversas
      </p>
    </div>
  )
}
