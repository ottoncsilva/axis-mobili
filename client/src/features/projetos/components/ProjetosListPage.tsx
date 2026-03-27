import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetos } from '../hooks/useProjetos';
import type { ProjetosFiltros } from '../types/projetos.types';
import type { Projeto, TipoServico, StatusFaturamento } from '@/types/global.types';
import { ETAPAS_LABELS } from '@/types/global.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ProjetoFormModal } from './ProjetoFormModal';
import { formatMoeda } from '@/lib/masks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  FolderKanban,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const TIPO_LABELS: Record<TipoServico, string> = {
  projeto_venda: 'Projeto Venda',
  projeto_executivo: 'Projeto Executivo',
  medicao: 'Medição',
};

const TIPO_COLORS: Record<TipoServico, string> = {
  projeto_venda: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  projeto_executivo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  medicao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const STATUS_FAT_LABELS: Record<StatusFaturamento, string> = {
  em_andamento: 'Em Andamento',
  pronto_para_faturar: 'Pronto p/ Faturar',
  faturado: 'Faturado',
};

export function ProjetosListPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<ProjetosFiltros>({
    busca: '',
    tipoServico: 'todos',
    statusFaturamento: 'todos',
  });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | undefined>();

  const { data: projetos, isLoading } = useProjetos(filtros);

  // Paginação
  const totalItems = projetos?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProjetos = projetos?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleEdit = (projeto: Projeto) => {
    setProjetoEditando(projeto);
    setModalOpen(true);
  };

  const handleNew = () => {
    setProjetoEditando(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projetos</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus projetos e serviços</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por loja, cliente final, ambiente..."
            value={filtros.busca}
            onChange={(e) => {
              setFiltros((f) => ({ ...f, busca: e.target.value }));
              setPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <select
          value={filtros.tipoServico}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, tipoServico: e.target.value as ProjetosFiltros['tipoServico'] }));
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="projeto_venda">Projeto Venda</option>
          <option value="projeto_executivo">Projeto Executivo</option>
          <option value="medicao">Medição</option>
        </select>
        <select
          value={filtros.statusFaturamento}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, statusFaturamento: e.target.value as ProjetosFiltros['statusFaturamento'] }));
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os Status</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="pronto_para_faturar">Pronto p/ Faturar</option>
          <option value="faturado">Faturado</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalItems === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto encontrado"
          description={filtros.busca ? 'Tente ajustar os filtros de busca.' : 'Cadastre seu primeiro projeto.'}
          actionLabel={!filtros.busca ? 'Novo Projeto' : undefined}
          onAction={!filtros.busca ? handleNew : undefined}
        />
      )}

      {/* Desktop Table */}
      {!isLoading && totalItems > 0 && (
        <>
          <div className="hidden md:block border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Loja / Cliente Final</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Ambientes</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Etapa Atual</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Valor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProjetos?.map((projeto) => (
                  <tr
                    key={projeto.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projetos/${projeto.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-foreground text-sm">{projeto.clienteNome}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">{projeto.clienteFinal.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', TIPO_COLORS[projeto.tipoServico])}>
                        {TIPO_LABELS[projeto.tipoServico]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {projeto.ambientes.length} amb.
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {ETAPAS_LABELS[projeto.etapaAtual] || projeto.etapaAtual}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">
                      {projeto.valorCalculado ? formatMoeda(projeto.valorCalculado) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={projeto.statusFaturamento === 'em_andamento' ? 'ativo' : projeto.statusFaturamento === 'faturado' ? 'concluido' : 'pendente'} label={STATUS_FAT_LABELS[projeto.statusFaturamento]} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/projetos/${projeto.id}`)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(projeto)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {projeto.linkGoogleDrive && (
                          <a
                            href={projeto.linkGoogleDrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                            title="Abrir no Drive"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedProjetos?.map((projeto) => (
              <div
                key={projeto.id}
                onClick={() => navigate(`/projetos/${projeto.id}`)}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-foreground text-sm">{projeto.clienteNome}</span>
                    <p className="text-xs text-muted-foreground">{projeto.clienteFinal.nome}</p>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', TIPO_COLORS[projeto.tipoServico])}>
                    {TIPO_LABELS[projeto.tipoServico]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {ETAPAS_LABELS[projeto.etapaAtual]} • {projeto.ambientes.length} amb.
                  </span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    {projeto.valorCalculado ? formatMoeda(projeto.valorCalculado) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalItems} projeto{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-foreground px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <ProjetoFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProjetoEditando(undefined);
        }}
        projeto={projetoEditando}
      />
    </div>
  );
}
