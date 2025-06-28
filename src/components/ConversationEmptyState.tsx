
import { MessageSquare } from "lucide-react"

interface ConversationEmptyStateProps {
  currentUser: any
}

export const ConversationEmptyState = ({ currentUser }: ConversationEmptyStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <MessageSquare className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {currentUser?.role === 'superadmin' 
            ? 'Selecione uma conta para visualizar conversas'
            : 'Configure sua conta para visualizar conversas'
          }
        </h3>
        <p className="text-gray-500 mb-6">
          {currentUser?.role === 'superadmin'
            ? 'Digite o ID da conta no filtro acima para visualizar as conversas.'
            : 'Verifique se sua conta está configurada corretamente.'
          }
        </p>
      </div>
    </div>
  )
}
