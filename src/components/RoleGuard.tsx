
import React from 'react'
import { usePermissions } from '@/hooks/useNewAuth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'admin' | 'agent' | 'cliente')[]
  requireSuperAdmin?: boolean
  requireAccountAccess?: number
  fallback?: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireSuperAdmin,
  requireAccountAccess,
  fallback
}) => {
  const { profile, isSuperAdmin, canManageAccount } = usePermissions()

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Verificar se precisa ser superadmin
  if (requireSuperAdmin && !isSuperAdmin()) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Acesso negado. Esta área é restrita a Super Administradores.
        </AlertDescription>
      </Alert>
    )
  }

  // Verificar acesso a conta específica
  if (requireAccountAccess && !canManageAccount(requireAccountAccess)) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Acesso negado. Você não tem permissão para acessar esta conta.
        </AlertDescription>
      </Alert>
    )
  }

  // Verificar papéis permitidos
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Acesso negado. Seu papel ({profile.role}) não tem permissão para acessar esta área.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
