import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes, useClientesMutation } from '../hooks/useClientes';
import type { ClientesFiltros } from '../types/clientes.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ClienteFormModal } from './ClienteFormModal';
import { formatCNPJ, formatTelefone } from '@/lib/masks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Building2,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cliente } from '@/types/global.types';

const ITEMS_PER_PAGE = 10;

export function ClientesListPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<ClientesFiltros>({ busca: '', status: 'todos' });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | undefined>();
  const [confirmToggle, setConfirmToggle] = useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useClientes(filtros);
  const { toggleAtivo } = useClientesMutation();

  // Paginação
  const totalItems = clientes?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedClientes = clientes?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleToggleAtivo = async () => {
    if (!confirmToggle) return;
    await toggleAtivo.mutateAsync({
      id: confirmToggle.id,
      ativo: !confirmToggle.ativo,
    });
    setConfirmToggle(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModalOpen(true);
  };

  const handleNew = () => {
    setClienteEditando(undefined);
    setModalOpen(true);
  };

  const getContatoPrincipal = (cliente: Cliente) => {
    return cliente.contatos?.find((c) => c.principal) || cliente.contatos?.[0];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">Gerencie suas lojas parceiras</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ, cidade..."
            value={filtros.busca}
            onChange={(e) => {
              setFiltros((f) => ({ ...f, busca: e.target.value }));
              setPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <select
          value={filtros.status}
          onChange={(e) => {
            setFiltros((f) => ({ ...f, status: e.target.value as ClientesFiltros['status'] }));
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
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
          icon={Building2}
          title="Nenhum cliente encontrado"
          description={filtros.busca ? 'Tente ajustar os filtros de busca.' : 'Cadastre sua primeira loja parceira.'}
          actionLabel={!filtros.busca ? 'Novo Cliente' : undefined}
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
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Nome Fantasia</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">CNPJ</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Cidade/UF</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Contato Principal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedClientes?.map((cliente) => {
                  const contato = getContatoPrincipal(cliente);
                  return (
                    <tr
                      key={cliente.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{cliente.nomeFantasia}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {formatCNPJ(cliente.cnpj)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {cliente.endereco.cidade}/{cliente.endereco.estado}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contato ? (
                          <div>
                            <span className="text-foreground">{contato.nome}</span>
                            <br />
                            <span className="text-muted-foreground text-xs">{formatTelefone(contato.telefone)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cliente.ativo ? 'ativo' : 'inativo'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/clientes/${cliente.id}`)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmToggle(cliente)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                            title={cliente.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {cliente.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedClientes?.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => navigate(`/clientes/${cliente.id}`)}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{cliente.nomeFantasia}</span>
                  <StatusBadge status={cliente.ativo ? 'ativo' : 'inativo'} />
                </div>
                <p className="text-sm text-muted-foreground font-mono">{formatCNPJ(cliente.cnpj)}</p>
                <p className="text-sm text-muted-foreground">
                  {cliente.endereco.cidade}/{cliente.endereco.estado}
                </p>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalItems} cliente{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
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
      <ClienteFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteEditando(undefined);
        }}
        cliente={clienteEditando}
      />

      {/* Confirm Toggle */}
      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.ativo ? 'Desativar Cliente' : 'Ativar Cliente'}
        description={
          confirmToggle?.ativo
            ? `Deseja desativar "${confirmToggle?.nomeFantasia}"? Ele não aparecerá mais nas listagens.`
            : `Deseja reativar "${confirmToggle?.nomeFantasia}"?`
        }
        confirmText={confirmToggle?.ativo ? 'Desativar' : 'Ativar'}
        variant={confirmToggle?.ativo ? 'destructive' : 'default'}
        onConfirm={handleToggleAtivo}
        onCancel={() => setConfirmToggle(null)}
        loading={toggleAtivo.isPending}
      />
    </div>
  );
}
