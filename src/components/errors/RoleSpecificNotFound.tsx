
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building2, 
  Settings, 
  MessageSquare, 
  User, 
  ArrowLeft, 
  Home,
  AlertTriangle 
} from 'lucide-react'

interface RoleSpecificNotFoundProps {
  role: 'superadmin' | 'admin' | 'agent' | 'cliente'
}

export const RoleSpecificNotFound = ({ role }: RoleSpecificNotFoundProps) => {
  const navigate = useNavigate()

  const getRoleConfig = () => {
    switch (role) {
      case 'superadmin':
        return {
          icon: Building2,
          title: 'Página não encontrada - Super Admin',
          description: 'A página que você está procurando não existe no painel de super administração.',
          homeRoute: '/superadmin',
          homeLabel: 'Voltar ao Dashboard',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        }
      case 'admin':
        return {
          icon: Settings,
          title: 'Página não encontrada - Admin',
          description: 'A página que você está procurando não existe no painel administrativo.',
          homeRoute: '/admin',
          homeLabel: 'Voltar ao Dashboard',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
      case 'agent':
        return {
          icon: MessageSquare,
          title: 'Página não encontrada - Agente',
          description: 'A página que você está procurando não existe na central de atendimento.',
          homeRoute: '/inbox',
          homeLabel: 'Voltar ao Inbox',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
      case 'cliente':
        return {
          icon: User,
          title: 'Página não encontrada - Cliente',
          description: 'A página que você está procurando não existe na área do cliente.',
          homeRoute: '/client',
          homeLabel: 'Voltar ao Início',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        }
    }
  }

  const config = getRoleConfig()
  const IconComponent = config.icon

  return (
    <div className={`min-h-screen flex items-center justify-center ${config.bgColor} px-4`}>
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AlertTriangle className="h-16 w-16 text-gray-400" />
                  <IconComponent className={`h-8 w-8 ${config.iconColor} absolute -top-1 -right-1`} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {config.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {config.description}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(config.homeRoute)}
                className={`w-full ${config.buttonColor} text-white`}
              >
                <Home className="h-4 w-4 mr-2" />
                {config.homeLabel}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à página anterior
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
