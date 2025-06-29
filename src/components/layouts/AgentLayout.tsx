
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { usePermissions } from "@/hooks/useNewAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Headphones, User } from "lucide-react"

interface AgentLayoutProps {
  children: React.ReactNode
}

export const AgentLayout = ({ children }: AgentLayoutProps) => {
  const { profile, isAgent, isAdmin, isSuperAdmin } = usePermissions()

  if (!isAgent() && !isAdmin() && !isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Headphones className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Área restrita a Agentes.
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
            {/* Header específico do agente */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Central de Atendimento
                    </h1>
                    <p className="text-sm text-gray-500">
                      Suas conversas e atendimentos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-green-700">
                      {profile?.role === 'admin' ? 'Admin' : 
                       profile?.role === 'superadmin' ? 'Super Admin' : 'Agente'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {profile?.name || profile?.email}
                  </div>
                </div>
              </div>
            </header>
            
            {/* Conteúdo principal */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
