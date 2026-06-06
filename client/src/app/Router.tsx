import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AlterarSenhaPage } from '@/features/auth/pages/AlterarSenhaPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Clientes
import { ClientesListPage } from '@/features/clientes/components/ClientesListPage';
import { ClienteDetailPage } from '@/features/clientes/components/ClienteDetailPage';

// Projetos
import { ProjetosListPage } from '@/features/projetos/components/ProjetosListPage';
import { ProjetoDetailPage } from '@/features/projetos/components/ProjetoDetailPage';

// Kanban
import { KanbanVendaPage } from '@/features/kanban/pages/KanbanVendaPage';
import { KanbanExecutivoPage } from '@/features/kanban/pages/KanbanExecutivoPage';
import { KanbanMedicaoPage } from '@/features/kanban/pages/KanbanMedicaoPage';

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Configurações
import { ConfiguracoesLayout } from '@/features/configuracoes/components/ConfiguracoesLayout';
import { ConfigEmpresaPage } from '@/features/configuracoes/pages/ConfigEmpresaPage';
import { ConfigEtapasPage } from '@/features/configuracoes/pages/ConfigEtapasPage';
import { ConfigPermissoesPage } from '@/features/configuracoes/pages/ConfigPermissoesPage';
import { ConfigNotificacoesPage } from '@/features/configuracoes/pages/ConfigNotificacoesPage';
import { ConfigFeriadosPage } from '@/features/configuracoes/pages/ConfigFeriadosPage';

// Colaboradores
import { ColaboradoresListPage } from '@/features/colaboradores/components/ColaboradoresListPage';

// Faturamento
import { FaturamentosPage } from '@/features/faturamento/pages/FaturamentosPage';

// Relatórios
import { RelatoriosPage } from '@/features/relatorios/pages/RelatoriosPage';

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
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

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
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alterar-senha"
            element={
              <ProtectedRoute>
                <AlterarSenhaPage />
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
                <KanbanVendaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/executivo"
            element={
              <ProtectedRoute modulo="kanbanExecutivo">
                <KanbanExecutivoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/medicao"
            element={
              <ProtectedRoute modulo="kanbanMedicao">
                <KanbanMedicaoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faturamento"
            element={
              <ProtectedRoute modulo="faturamento">
                <FaturamentosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colaboradores"
            element={
              <ProtectedRoute modulo="colaboradores">
                <ColaboradoresListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ProtectedRoute modulo="relatorios">
                <RelatoriosPage />
              </ProtectedRoute>
            }
          />

          <Route path="/configuracoes" element={<ProtectedRoute modulo="configuracoes"><ConfiguracoesLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/configuracoes/empresa" replace />} />
            <Route path="empresa" element={<ConfigEmpresaPage />} />
            <Route path="etapas" element={<ConfigEtapasPage />} />
            <Route path="permissoes" element={<ConfigPermissoesPage />} />
            <Route path="feriados" element={<ConfigFeriadosPage />} />
            <Route path="notificacoes" element={<ConfigNotificacoesPage />} />
          </Route>

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
