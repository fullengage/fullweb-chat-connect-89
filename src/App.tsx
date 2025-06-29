
import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/NewAuthContext'
import { EnhancedProtectedRoute } from '@/components/auth/EnhancedProtectedRoute'
import { RoleBasedRedirect } from '@/components/auth/RoleBasedRedirect'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { AgentLayout } from '@/components/layouts/AgentLayout'
import { ClientLayout } from '@/components/layouts/ClientLayout'
import { RoleSpecificNotFound } from '@/components/errors/RoleSpecificNotFound'

// Lazy loading das páginas
const NewAuth = lazy(() => import('@/pages/NewAuth'))
const SuperAdmin = lazy(() => import('@/pages/SuperAdmin'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Conversations = lazy(() => import('@/pages/Conversations'))
const Contacts = lazy(() => import('@/pages/Contacts'))
const Agents = lazy(() => import('@/pages/Agents'))
const Teams = lazy(() => import('@/pages/Teams'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Accounts = lazy(() => import('@/pages/Accounts'))
const Inbox = lazy(() => import('@/pages/Inbox'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Rota de autenticação */}
                <Route path="/login" element={<NewAuth />} />
                
                {/* Rota raiz com redirecionamento inteligente */}
                <Route
                  path="/"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />

                {/* Rotas do Super Admin */}
                <Route path="/superadmin/*" element={
                  <EnhancedProtectedRoute requireSuperAdmin>
                    <SuperAdminLayout>
                      <Routes>
                        <Route index element={<SuperAdmin />} />
                        <Route path="dashboard" element={<SuperAdmin />} />
                        <Route path="accounts" element={<Accounts />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="*" element={<RoleSpecificNotFound role="superadmin" />} />
                      </Routes>
                    </SuperAdminLayout>
                  </EnhancedProtectedRoute>
                } />

                {/* Rotas do Admin */}
                <Route path="/admin/*" element={
                  <EnhancedProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="conversations" element={<Conversations />} />
                        <Route path="contacts" element={<Contacts />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="teams" element={<Teams />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="*" element={<RoleSpecificNotFound role="admin" />} />
                      </Routes>
                    </AdminLayout>
                  </EnhancedProtectedRoute>
                } />

                {/* Rota do Agente */}
                <Route
                  path="/inbox"
                  element={
                    <EnhancedProtectedRoute allowedRoles={['agent', 'admin', 'superadmin']}>
                      <AgentLayout>
                        <Inbox />
                      </AgentLayout>
                    </EnhancedProtectedRoute>
                  }
                />

                {/* Rotas do Cliente */}
                <Route path="/client/*" element={
                  <EnhancedProtectedRoute allowedRoles={['cliente']}>
                    <ClientLayout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="conversations" element={<Conversations />} />
                        <Route path="*" element={<RoleSpecificNotFound role="cliente" />} />
                      </Routes>
                    </ClientLayout>
                  </EnhancedProtectedRoute>
                } />

                {/* Rotas de compatibilidade (redirecionam para as novas estruturas) */}
                <Route
                  path="/dashboard"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/conversations"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/agents"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin"
                  element={
                    <EnhancedProtectedRoute>
                      <RoleBasedRedirect />
                    </EnhancedProtectedRoute>
                  }
                />
                
                {/* 404 genérico */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">Página não encontrada</p>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Voltar ao início
                      </button>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
