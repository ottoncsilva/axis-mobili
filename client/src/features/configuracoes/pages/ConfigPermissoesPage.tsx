import { useState } from 'react';
import type { PermissoesPerfil, PerfilUsuario } from '@/types/global.types';
import { usePermissoes, useUpdatePermissoes } from '@/hooks/useConfiguracoes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

type PerfilTab = PerfilUsuario;

const PERFIS: { value: PerfilTab; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'projetista', label: 'Projetista' },
  { value: 'medidor', label: 'Medidor' },
  { value: 'financeiro', label: 'Financeiro' },
];

export function ConfigPermissoesPage() {
  const { data: permissoes, isLoading } = usePermissoes();
  const updatePermissoes = useUpdatePermissoes();
  const [editing, setEditing] = useState<Record<PerfilUsuario, PermissoesPerfil> | null>(null);

  if (permissoes && !editing) {
    setEditing(permissoes);
  }

  const handleToggle = (perfil: PerfilUsuario, path: string, value: boolean) => {
    if (!editing) return;

    const keys = path.split('.');
    const updated = { ...editing[perfil] };
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setEditing({
      ...editing,
      [perfil]: updated,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updatePermissoes.mutateAsync(editing);
      toast.success('Permissões atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar permissões');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const renderPerfilTab = (perfil: PerfilUsuario, perm: PermissoesPerfil | undefined) => {
    if (!perm) return null;

    return (
      <TabsContent value={perfil} className="space-y-6">
        {/* Gerais */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Gerais</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Dashboard</Label>
              <Switch
                checked={perm.dashboard}
                onCheckedChange={(value) => handleToggle(perfil, 'dashboard', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Relatórios</Label>
              <Switch
                checked={perm.relatorios}
                onCheckedChange={(value) => handleToggle(perfil, 'relatorios', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Configurações</Label>
              <Switch
                checked={perm.configuracoes}
                onCheckedChange={(value) => handleToggle(perfil, 'configuracoes', value)}
              />
            </div>
          </div>
        </Card>

        {/* Clientes */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Clientes</h3>
          <div className="space-y-3">
            {['visualizar', 'criar', 'editar', 'excluir'].map((acao) => (
              <div key={acao} className="flex items-center justify-between">
                <Label className="capitalize">{acao}</Label>
                <Switch
                  checked={(perm.clientes as any)[acao]}
                  onCheckedChange={(value) =>
                    handleToggle(perfil, `clientes.${acao}`, value)
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Projetos */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Projetos</h3>
          <div className="space-y-3">
            {['visualizar', 'criar', 'editar', 'excluir'].map((acao) => (
              <div key={acao} className="flex items-center justify-between">
                <Label className="capitalize">{acao}</Label>
                <Switch
                  checked={(perm.projetos as any)[acao]}
                  onCheckedChange={(value) =>
                    handleToggle(perfil, `projetos.${acao}`, value)
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Kanbans */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Kanbans</h3>
          <div className="space-y-4">
            {[
              { key: 'kanbanVenda', label: 'Kanban Venda' },
              { key: 'kanbanExecutivo', label: 'Kanban Executivo' },
              { key: 'kanbanMedicao', label: 'Kanban Medição' },
            ].map(({ key, label }) => (
              <div key={key}>
                <h4 className="font-medium text-sm mb-2">{label}</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Visualizar</Label>
                    <Switch
                      checked={(perm[key as keyof PermissoesPerfil] as any)?.visualizar}
                      onCheckedChange={(value) =>
                        handleToggle(perfil, `${key}.visualizar`, value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Operar</Label>
                    <Switch
                      checked={(perm[key as keyof PermissoesPerfil] as any)?.operar}
                      onCheckedChange={(value) =>
                        handleToggle(perfil, `${key}.operar`, value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Faturamento */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Faturamento</h3>
          <div className="space-y-3">
            {['visualizar', 'criar', 'editar'].map((acao) => (
              <div key={acao} className="flex items-center justify-between">
                <Label className="capitalize">{acao}</Label>
                <Switch
                  checked={(perm.faturamento as any)[acao]}
                  onCheckedChange={(value) =>
                    handleToggle(perfil, `faturamento.${acao}`, value)
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Colaboradores */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Colaboradores</h3>
          <div className="space-y-3">
            {['visualizar', 'criar', 'editar', 'excluir'].map((acao) => (
              <div key={acao} className="flex items-center justify-between">
                <Label className="capitalize">{acao}</Label>
                <Switch
                  checked={(perm.colaboradores as any)[acao]}
                  onCheckedChange={(value) =>
                    handleToggle(perfil, `colaboradores.${acao}`, value)
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Permissões</h1>
        <p className="text-gray-500 mt-1">
          Configure as permissões de cada perfil de usuário
        </p>
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList>
          {PERFIS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PERFIS.map(({ value }) =>
          renderPerfilTab(value, editing?.[value])
        )}
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updatePermissoes.isPending}
          loading={updatePermissoes.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
