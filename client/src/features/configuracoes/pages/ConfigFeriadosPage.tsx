import { useState, useEffect } from 'react';
import { useFeriados, useUpdateFeriados } from '@/hooks/useConfiguracoes';
import type { ConfigFeriados } from '../services/configuracoesService';
import type { Feriado } from '@/types/global.types';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ConfigFeriadosPage() {
  const { data: feriados, isLoading } = useFeriados();
  const updateFeriados = useUpdateFeriados();
  const [editing, setEditing] = useState<ConfigFeriados | null>(null);
  const [novoFeriado, setNovoFeriado] = useState({ nome: '', data: '' });

  useEffect(() => {
    if (feriados && !editing) {
      setEditing(feriados);
    }
  }, [feriados]);

  const toggleFeriadoPadrao = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      feriadosPadrao: editing.feriadosPadrao.map((f) =>
        f.id === id ? { ...f, ativo: !f.ativo } : f
      ),
    });
  };

  const adicionarFeriadoCustom = () => {
    if (!editing) return;
    if (!novoFeriado.nome.trim() || !novoFeriado.data.trim()) {
      toast.error('Preencha o nome e a data do feriado');
      return;
    }
    // Validate data format DD/MM
    if (!/^\d{2}\/\d{2}$/.test(novoFeriado.data)) {
      toast.error('Use o formato DD/MM para a data');
      return;
    }

    const novo: Feriado = {
      id: `custom_${Date.now()}`,
      nome: novoFeriado.nome.trim(),
      data: novoFeriado.data.trim(),
      recorrente: true,
      ativo: true,
    };

    setEditing({
      ...editing,
      feriadosCustom: [...editing.feriadosCustom, novo],
    });
    setNovoFeriado({ nome: '', data: '' });
  };

  const removerFeriadoCustom = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      feriadosCustom: editing.feriadosCustom.filter((f) => f.id !== id),
    });
  };

  const toggleFeriadoCustom = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      feriadosCustom: editing.feriadosCustom.map((f) =>
        f.id === id ? { ...f, ativo: !f.ativo } : f
      ),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateFeriados.mutateAsync(editing);
      toast.success('Feriados salvos com sucesso!');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    }
  };

  if (isLoading || !editing) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendário de Feriados</h1>
        <p className="text-muted-foreground mt-1">
          Feriados inativos não são descontados do cálculo de dias úteis do SLA
        </p>
      </div>

      {/* Sábado como dia útil */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Sábado como dia útil</p>
            <p className="text-sm text-muted-foreground">Quando ativado, sábados entram no cálculo de SLA</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing({ ...editing, sabadoDiaUtil: !editing.sabadoDiaUtil })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
              editing.sabadoDiaUtil ? 'bg-brand-600' : 'bg-muted-foreground/30'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                editing.sabadoDiaUtil ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Feriados Nacionais */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <CalendarDays className="h-5 w-5 text-brand-600" />
          <div>
            <p className="font-semibold text-foreground">Feriados Nacionais</p>
            <p className="text-sm text-muted-foreground">Ative ou desative cada feriado conforme sua região</p>
          </div>
        </div>

        <div className="space-y-2">
          {editing.feriadosPadrao.map((feriado) => (
            <div
              key={feriado.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-xs font-mono font-semibold px-2 py-0.5 rounded',
                    feriado.ativo
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {feriado.data}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    feriado.ativo ? 'text-foreground' : 'text-muted-foreground line-through'
                  )}
                >
                  {feriado.nome}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFeriadoPadrao(feriado.id)}
                className={cn(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0',
                  feriado.ativo ? 'bg-brand-600' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                    feriado.ativo ? 'translate-x-[18px]' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feriados Personalizados */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div>
            <p className="font-semibold text-foreground">Feriados Personalizados</p>
            <p className="text-sm text-muted-foreground">Feriados regionais, municipais ou corporativos</p>
          </div>
        </div>

        {/* Formulário para adicionar */}
        <div className="flex gap-2">
          <input
            value={novoFeriado.nome}
            onChange={(e) => setNovoFeriado({ ...novoFeriado, nome: e.target.value })}
            placeholder="Ex: Aniversário da Cidade"
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <input
            value={novoFeriado.data}
            onChange={(e) => setNovoFeriado({ ...novoFeriado, data: e.target.value })}
            placeholder="DD/MM"
            maxLength={5}
            className="w-24 h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <Button size="sm" onClick={adicionarFeriadoCustom} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {editing.feriadosCustom.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum feriado personalizado cadastrado
          </p>
        ) : (
          <div className="space-y-2">
            {editing.feriadosCustom.map((feriado) => (
              <div
                key={feriado.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs font-mono font-semibold px-2 py-0.5 rounded',
                      feriado.ativo
                        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {feriado.data}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      feriado.ativo ? 'text-foreground' : 'text-muted-foreground line-through'
                    )}
                  >
                    {feriado.nome}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFeriadoCustom(feriado.id)}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0',
                      feriado.ativo ? 'bg-brand-600' : 'bg-muted-foreground/30'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                        feriado.ativo ? 'translate-x-[18px]' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                  <button
                    onClick={() => removerFeriadoCustom(feriado.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateFeriados.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
