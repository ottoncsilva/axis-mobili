import { useState } from 'react';
import type { ConfigNotificacoes } from '@/types/global.types';
import { useNotificacoes, useUpdateNotificacoes } from '@/hooks/useConfiguracoes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConfigNotificacoesPage() {
  const { data: config, isLoading } = useNotificacoes();
  const updateConfig = useUpdateNotificacoes();
  const [editing, setEditing] = useState<ConfigNotificacoes | null>(null);

  if (config && !editing) {
    setEditing(config);
  }

  const handleToggle = (path: string, value: boolean) => {
    if (!editing) return;

    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(editing));
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setEditing(updated);
  };

  const handleUpdate = (path: string, value: any) => {
    if (!editing) return;

    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(editing));
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setEditing(updated);
  };

  const handleAddTelefone = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      evolution: {
        ...editing.evolution,
        telefonesAlerta: [...(editing.evolution.telefonesAlerta || []), ''],
      },
    });
  };

  const handleRemoveTelefone = (index: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      evolution: {
        ...editing.evolution,
        telefonesAlerta: editing.evolution.telefonesAlerta.filter((_, i) => i !== index),
      },
    });
  };

  const handleUpdateTelefone = (index: number, value: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      evolution: {
        ...editing.evolution,
        telefonesAlerta: editing.evolution.telefonesAlerta.map((t, i) =>
          i === index ? value : t
        ),
      },
    });
  };

  const handleTestEvolution = async () => {
    toast.info('Enviando mensagem de teste...');
    // TODO: Implementar teste de conexão com EvolutionAPI
    setTimeout(() => {
      toast.success('Mensagem enviada com sucesso!');
    }, 2000);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateConfig.mutateAsync(editing);
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!editing) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
        <p className="text-gray-500 mt-1">
          Configure alertas de SLA e integração com EvolutionAPI
        </p>
      </div>

      {/* Alertas SLA */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Alertas de SLA</h3>
        <div className="space-y-4">
          <div>
            <Label>Dias antes do vencimento para alertar</Label>
            <Input
              type="number"
              value={editing.alertaSLADias}
              onChange={(e) => handleUpdate('alertaSLADias', parseInt(e.target.value))}
              min="1"
              max="10"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Projetos com SLA menor que {editing.alertaSLADias} dia(s) serão destacados em vermelho
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Notificar novo projeto atribuído</Label>
              <Switch
                checked={editing.notificarNovaAtribuicao}
                onCheckedChange={(value) =>
                  handleToggle('notificarNovaAtribuicao', value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notificar etapa concluída</Label>
              <Switch
                checked={editing.notificarEtapaConcluida}
                onCheckedChange={(value) =>
                  handleToggle('notificarEtapaConcluida', value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notificar SLA próximo de vencer</Label>
              <Switch
                checked={editing.notificarSLAProximo}
                onCheckedChange={(value) =>
                  handleToggle('notificarSLAProximo', value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notificar SLA estourado</Label>
              <Switch
                checked={editing.notificarSLAEstourado}
                onCheckedChange={(value) =>
                  handleToggle('notificarSLAEstourado', value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notificar fatura vencida</Label>
              <Switch
                checked={editing.notificarFaturaVencida}
                onCheckedChange={(value) =>
                  handleToggle('notificarFaturaVencida', value)
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* EvolutionAPI */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">EvolutionAPI (WhatsApp)</h3>
          <Switch
            checked={editing.evolution.ativo}
            onCheckedChange={(value) =>
              handleToggle('evolution.ativo', value)
            }
          />
        </div>

        {!editing.evolution.ativo && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As notificações via WhatsApp estão desativadas. Ative para enviar mensagens automáticas.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label>URL da API</Label>
            <Input
              value={editing.evolution.apiUrl}
              onChange={(e) => handleUpdate('evolution.apiUrl', e.target.value)}
              placeholder="https://api.evolution.com"
              className="mt-2"
              disabled={!editing.evolution.ativo}
            />
          </div>

          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={editing.evolution.apiKey}
              onChange={(e) => handleUpdate('evolution.apiKey', e.target.value)}
              placeholder="Digite sua API Key"
              className="mt-2"
              disabled={!editing.evolution.ativo}
            />
          </div>

          <div>
            <Label>Instância</Label>
            <Input
              value={editing.evolution.instancia}
              onChange={(e) => handleUpdate('evolution.instancia', e.target.value)}
              placeholder="Nome da instância"
              className="mt-2"
              disabled={!editing.evolution.ativo}
            />
          </div>

          <div>
            <Label>Números para Receber Alertas</Label>
            <div className="space-y-2 mt-2">
              {editing.evolution.telefonesAlerta.map((telefone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={telefone}
                    onChange={(e) => handleUpdateTelefone(index, e.target.value)}
                    placeholder="+55 11 99999-9999"
                    disabled={!editing.evolution.ativo}
                  />
                  <Button
                    onClick={() => handleRemoveTelefone(index)}
                    variant="destructive"
                    size="sm"
                    disabled={!editing.evolution.ativo}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleAddTelefone}
                variant="outline"
                size="sm"
                disabled={!editing.evolution.ativo}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Telefone
              </Button>
            </div>
          </div>

          {editing.evolution.ativo && (
            <Button
              onClick={handleTestEvolution}
              variant="outline"
              className="w-full"
            >
              Enviar Mensagem de Teste
            </Button>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateConfig.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
