
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/useNewAuth'
import { Loader2 } from 'lucide-react'

interface RoleBasedRedirectProps {
  children?: React.ReactNode
}

export const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const navigate = useNavigate()
  const { profile, isSuperAdmin, isAdmin, isAgent, isClient } = usePermissions()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    if (!profile) {
      return // Still loading profile
    }

    const redirectByRole = () => {
      try {
        if (isSuperAdmin()) {
          console.log('🔄 Redirecting superadmin to /superadmin')
          navigate('/superadmin', { replace: true })
        } else if (isAdmin()) {
          console.log('🔄 Redirecting admin to /admin')
          navigate('/admin', { replace: true })
        } else if (isAgent()) {
          console.log('🔄 Redirecting agent to /inbox')
          navigate('/inbox', { replace: true })
        } else if (isClient()) {
          console.log('🔄 Redirecting client to /client')
          navigate('/client', { replace: true })
        } else {
          console.warn('⚠️ Unknown role, redirecting to default')
          navigate('/inbox', { replace: true })
        }
      } catch (error) {
        console.error('❌ Error in role-based redirect:', error)
        navigate('/inbox', { replace: true })
      } finally {
        setTimeout(() => setIsRedirecting(false), 100)
      }
    }

    redirectByRole()
  }, [profile, navigate, isSuperAdmin, isAdmin, isAgent, isClient])

  if (!profile || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Preparando seu painel...
            </h2>
            <p className="text-gray-600 mb-4">
              Verificando suas permissões e carregando a interface adequada
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
