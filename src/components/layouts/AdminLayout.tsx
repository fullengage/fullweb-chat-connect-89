
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { usePermissions } from "@/hooks/useNewAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Users, Building } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { profile, isAdmin, isSuperAdmin } = usePermissions()

  if (!isAdmin() && !isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Settings className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Área restrita a Administradores.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1">
            {/* Header específico do admin */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Painel Administrativo
                    </h1>
                    <p className="text-sm text-gray-500">
                      Gerenciamento da empresa
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-blue-700">
                      {profile?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {profile?.name || profile?.email}
                  </div>
                </div>
              </div>
            </header>
            
            {/* Conteúdo principal */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
