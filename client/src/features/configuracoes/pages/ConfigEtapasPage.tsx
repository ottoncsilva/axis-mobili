import { useState } from 'react';
import type { EtapaConfig, ConfigEtapas } from '@/types/global.types';
import { useEtapas, useUpdateEtapas } from '@/hooks/useConfiguracoes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigEtapasPage() {
  const { data: etapas, isLoading } = useEtapas();
  const updateEtapas = useUpdateEtapas();

  const [editing, setEditing] = useState<ConfigEtapas | null>(etapas || null);

  // Sincronizar quando dados chegam
  if (etapas && !editing) {
    setEditing(etapas);
  }

  const handleAddEtapa = (tipo: 'projetoVenda' | 'projetoExecutivo' | 'medicao') => {
    if (!editing) return;

    const novaEtapa: EtapaConfig = {
      id: `etapa_${Date.now()}`,
      nome: `etapa_${Date.now()}`,
      label: 'Nova Etapa',
      ordem: (editing[tipo]?.length || 0) + 1,
      sla: 3,
    };

    setEditing({
      ...editing,
      [tipo]: [...(editing[tipo] || []), novaEtapa],
    });
  };

  const handleDeleteEtapa = (tipo: 'projetoVenda' | 'projetoExecutivo' | 'medicao', id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      [tipo]: editing[tipo].filter((e) => e.id !== id),
    });
  };

  const handleUpdateEtapa = (
    tipo: 'projetoVenda' | 'projetoExecutivo' | 'medicao',
    id: string,
    field: string,
    value: any
  ) => {
    if (!editing) return;
    setEditing({
      ...editing,
      [tipo]: editing[tipo].map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateEtapas.mutateAsync(editing);
      toast.success('Etapas atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar etapas');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const renderEtapasTab = (tipo: 'projetoVenda' | 'projetoExecutivo' | 'medicao', label: string) => (
    <TabsContent value={tipo} className="space-y-4">
      <Button
        onClick={() => handleAddEtapa(tipo)}
        size="sm"
        variant="outline"
        className="mb-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Etapa
      </Button>

      <div className="space-y-3">
        {editing?.[tipo]?.map((etapa) => (
          <Card key={etapa.id} className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Label (Exibição)</Label>
                  <Input
                    value={etapa.label}
                    onChange={(e) =>
                      handleUpdateEtapa(tipo, etapa.id, 'label', e.target.value)
                    }
                    placeholder="Ex: Projetar Ambientes"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Nome (Identificador)</Label>
                  <Input
                    value={etapa.nome}
                    onChange={(e) =>
                      handleUpdateEtapa(tipo, etapa.id, 'nome', e.target.value)
                    }
                    placeholder="Ex: projetar_ambientes"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    value={etapa.ordem}
                    onChange={(e) =>
                      handleUpdateEtapa(tipo, etapa.id, 'ordem', parseInt(e.target.value))
                    }
                    min="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">SLA (dias úteis)</Label>
                  <Input
                    type="number"
                    value={etapa.sla}
                    onChange={(e) =>
                      handleUpdateEtapa(tipo, etapa.id, 'sla', parseInt(e.target.value))
                    }
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleDeleteEtapa(tipo, etapa.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </TabsContent>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Etapas</h1>
        <p className="text-gray-500 mt-1">
          Customize as fases de cada tipo de projeto e defina SLAs
        </p>
      </div>

      <Tabs defaultValue="projetoVenda" className="w-full">
        <TabsList>
          <TabsTrigger value="projetoVenda">Projeto Venda</TabsTrigger>
          <TabsTrigger value="projetoExecutivo">Projeto Executivo</TabsTrigger>
          <TabsTrigger value="medicao">Medição</TabsTrigger>
        </TabsList>

        {renderEtapasTab('projetoVenda', 'Projeto Venda')}
        {renderEtapasTab('projetoExecutivo', 'Projeto Executivo')}
        {renderEtapasTab('medicao', 'Medição')}
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateEtapas.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
