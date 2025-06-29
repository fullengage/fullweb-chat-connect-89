
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { usePermissions } from "@/hooks/useNewAuth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, MessageCircle } from "lucide-react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const { profile, isClient } = usePermissions()

  if (!isClient()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <User className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Área restrita a Clientes.
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
            {/* Header específico do cliente */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Área do Cliente
                    </h1>
                    <p className="text-sm text-gray-500">
                      Suas solicitações e atendimentos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-orange-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-orange-700">
                      Cliente
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
