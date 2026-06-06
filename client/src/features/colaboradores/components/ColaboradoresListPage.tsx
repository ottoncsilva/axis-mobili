import { useState } from 'react';
import { useUsuarios, useUsuariosMutation } from '../hooks/useUsuarios';
import { UsuarioFormModal } from './UsuarioFormModal';
import type { Usuario } from '../types/usuarios.types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, Search, ToggleLeft, ToggleRight } from 'lucide-react';

const PERFIL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  projetista: 'Projetista',
  medidor: 'Medidor',
  financeiro: 'Financeiro',
};

export function ColaboradoresListPage() {
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const { data: usuarios = [], isLoading, refetch } = useUsuarios({ busca });
  const { toggleAtivo, excluir } = useUsuariosMutation();

  const handleExcluir = async (usuario: Usuario) => {
    if (!confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) return;
    try {
      await excluir.mutateAsync(usuario.id);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleAtivo = async (usuario: Usuario) => {
    try {
      await toggleAtivo.mutateAsync({ id: usuario.id, ativo: !usuario.ativo });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-muted-foreground">Gerencie usuários e seus acessos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => { setUsuarioSelecionado(null); setModalAberto(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold text-foreground">Nome</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Perfil</th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-right font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{usuario.nome}</td>
                  <td className="px-6 py-4 text-muted-foreground">{usuario.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                      {PERFIL_LABELS[usuario.perfil]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.ativo
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleAtivo(usuario)}
                        disabled={toggleAtivo.isPending}
                        className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                        title={usuario.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {usuario.ativo ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => { setUsuarioSelecionado(usuario); setModalAberto(true); }}
                        className="px-3 py-1 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-600/10 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(usuario)}
                        disabled={excluir.isPending}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UsuarioFormModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        usuario={usuarioSelecionado || undefined}
      />
    </div>
  );
}
