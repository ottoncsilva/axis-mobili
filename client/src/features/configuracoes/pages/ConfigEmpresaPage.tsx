import { useState, useEffect } from 'react';
import { useEmpresa, useUpdateEmpresa } from '@/hooks/useConfiguracoes';
import type { ConfigEmpresa } from '../services/configuracoesService';
import { Button } from '@/components/ui/button';
import { Save, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { maskCNPJ, maskTelefone } from '@/lib/masks';

export function ConfigEmpresaPage() {
  const { data: empresa, isLoading } = useEmpresa();
  const updateEmpresa = useUpdateEmpresa();
  const [editing, setEditing] = useState<ConfigEmpresa | null>(null);

  useEffect(() => {
    if (empresa && !editing) {
      setEditing(empresa);
    }
  }, [empresa]);

  const set = (field: keyof ConfigEmpresa, value: string) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateEmpresa.mutateAsync(editing);
      toast.success('Dados da empresa salvos com sucesso!');
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
        <h1 className="text-2xl font-bold">Dados da Empresa</h1>
        <p className="text-muted-foreground mt-1">Informações gerais da sua empresa exibidas no sistema</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Identificação</p>
            <p className="text-sm text-muted-foreground">Nome e dados fiscais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome da Empresa *</label>
            <input
              value={editing.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Ex: Axis Mobili"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CNPJ</label>
            <input
              value={editing.cnpj || ''}
              onChange={(e) => set('cnpj', maskCNPJ(e.target.value))}
              placeholder="00.000.000/0001-00"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="pt-2 pb-4 border-b border-border">
          <p className="font-medium text-foreground">Contato</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefone</label>
            <input
              value={editing.telefone || ''}
              onChange={(e) => set('telefone', maskTelefone(e.target.value))}
              placeholder="(XX) XXXXX-XXXX"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              value={editing.email || ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="contato@empresa.com"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Endereço</label>
          <input
            value={editing.endereco || ''}
            onChange={(e) => set('endereco', e.target.value)}
            placeholder="Rua, número, bairro, cidade - UF"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="pt-2 pb-4 border-b border-border">
          <p className="font-medium text-foreground">Identidade Visual</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">URL do Logo</label>
          <input
            value={editing.logoUrl || ''}
            onChange={(e) => set('logoUrl', e.target.value)}
            placeholder="https://exemplo.com/logo.png"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Link direto para a imagem do logo (PNG ou SVG recomendado)</p>
        </div>

        {editing.logoUrl && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3">
            <img
              src={editing.logoUrl}
              alt="Preview do logo"
              className="h-10 w-auto object-contain rounded"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <p className="text-xs text-muted-foreground">Preview do logo</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateEmpresa.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
