
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/NewAuthContext'
import { usePermissions } from '@/hooks/useNewAuth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, AlertTriangle } from 'lucide-react'

interface EnhancedProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'admin' | 'agent' | 'cliente')[]
  requireSuperAdmin?: boolean
  requireAccountAccess?: number
  redirectTo?: string
  fallback?: React.ReactNode
}

export const EnhancedProtectedRoute = ({
  children,
  allowedRoles,
  requireSuperAdmin,
  requireAccountAccess,
  redirectTo,
  fallback
}: EnhancedProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth()
  const { profile, isSuperAdmin, canManageAccount } = usePermissions()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return // Still loading auth

      // Not authenticated
      if (!user) {
        console.log('🔐 User not authenticated, redirecting to login')
        navigate('/login', { replace: true })
        return
      }

      // Profile not loaded yet
      if (!profile) {
        return // Keep loading
      }

      // Check superadmin requirement
      if (requireSuperAdmin && !isSuperAdmin()) {
        console.log('🚫 Superadmin access required')
        if (redirectTo) {
          navigate(redirectTo, { replace: true })
        }
        setIsChecking(false)
        return
      }

      // Check account access
      if (requireAccountAccess && !canManageAccount(requireAccountAccess)) {
        console.log('🚫 Account access denied')
        if (redirectTo) {
          navigate(redirectTo, { replace: true })
        }
        setIsChecking(false)
        return
      }

      // Check allowed roles
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        console.log(`🚫 Role ${profile.role} not in allowed roles:`, allowedRoles)
        if (redirectTo) {
          navigate(redirectTo, { replace: true })
        }
        setIsChecking(false)
        return
      }

      // All checks passed
      setIsChecking(false)
    }

    checkAccess()
  }, [user, profile, authLoading, allowedRoles, requireSuperAdmin, requireAccountAccess, redirectTo, navigate, isSuperAdmin, canManageAccount])

  // Show loading while checking auth or permissions
  if (authLoading || !profile || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar autenticado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Access denied
  if (requireSuperAdmin && !isSuperAdmin()) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Esta área é restrita a Super Administradores.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (requireAccountAccess && !canManageAccount(requireAccountAccess)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Você não tem permissão para acessar esta conta.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Seu papel ({profile.role}) não tem permissão para acessar esta área.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
