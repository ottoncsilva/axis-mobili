import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { ClientesListPage } from '@/features/clientes/components/ClientesListPage';
import { ClienteDetailPage } from '@/features/clientes/components/ClienteDetailPage';
import { ProjetosListPage } from '@/features/projetos/components/ProjetosListPage';
import { ProjetoDetailPage } from '@/features/projetos/components/ProjetoDetailPage';

// Placeholder pages for modules not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-600/10 flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">Em construção — disponível em breve</p>
      </div>
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginForm />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute modulo="dashboard">
                <PlaceholderPage title="Dashboard" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute modulo="clientes">
                <ClientesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes/:id"
            element={
              <ProtectedRoute modulo="clientes">
                <ClienteDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projetos"
            element={
              <ProtectedRoute modulo="projetos">
                <ProjetosListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projetos/:id"
            element={
              <ProtectedRoute modulo="projetos">
                <ProjetoDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kanban/venda"
            element={
              <ProtectedRoute modulo="kanbanVenda">
                <PlaceholderPage title="Kanban — Projetos para Venda" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/executivo"
            element={
              <ProtectedRoute modulo="kanbanExecutivo">
                <PlaceholderPage title="Kanban — Projetos Executivos" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/medicao"
            element={
              <ProtectedRoute modulo="kanbanMedicao">
                <PlaceholderPage title="Kanban — Medição Técnica" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faturamento"
            element={
              <ProtectedRoute modulo="faturamento">
                <PlaceholderPage title="Faturamento" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faturamento/:id"
            element={
              <ProtectedRoute modulo="faturamento">
                <PlaceholderPage title="Detalhes da Fatura" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colaboradores"
            element={
              <ProtectedRoute modulo="colaboradores">
                <PlaceholderPage title="Colaboradores" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ProtectedRoute modulo="relatorios">
                <PlaceholderPage title="Relatórios" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute modulo="configuracoes">
                <PlaceholderPage title="Configurações" />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="text-6xl">🔍</span>
                <h1 className="text-2xl font-semibold text-foreground">Página não encontrada</h1>
                <p className="text-muted-foreground">A página que você procura não existe.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
