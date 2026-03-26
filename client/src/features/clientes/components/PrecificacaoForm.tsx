import { Controller, type Control, type UseFormRegister } from 'react-hook-form';
import type { ClienteFormData } from '../types/clientes.types';
import type { TipoPrecificacao } from '@/types/global.types';

interface PrecificacaoFormProps {
  tipoServico: 'projetoVenda' | 'projetoExecutivo' | 'medicao';
  label: string;
  description: string;
  control: Control<ClienteFormData>;
  register: UseFormRegister<ClienteFormData>;
  tiposDisponiveis?: TipoPrecificacao[];
}

const TIPO_LABELS: Record<TipoPrecificacao, string> = {
  percentual_venda: '% do Preço de Venda',
  percentual_fabrica: '% do Preço de Fábrica',
  valor_combinado: 'Valor Combinado (R$)',
  valor_fixo_ambiente: 'Valor Fixo por Ambiente (R$)',
};

const DEFAULT_TIPOS: TipoPrecificacao[] = ['percentual_venda', 'percentual_fabrica', 'valor_combinado'];

export function PrecificacaoForm({
  tipoServico,
  label,
  description,
  control,
  register,
  tiposDisponiveis = DEFAULT_TIPOS,
}: PrecificacaoFormProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <h4 className="text-sm font-semibold text-foreground mb-1">{label}</h4>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Tipo de Cobrança</label>
          <select
            {...register(`precificacao.${tipoServico}.tipo`)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {tiposDisponiveis.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_LABELS[tipo]}
              </option>
            ))}
          </select>
        </div>

        <Controller
          name={`precificacao.${tipoServico}.valor`}
          control={control}
          render={({ field }) => {
            const tipoAtual = control._formValues?.precificacao?.[tipoServico]?.tipo || 'percentual_venda';
            const isPercentual = tipoAtual.startsWith('percentual');

            return (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Valor</label>
                <div className="relative">
                  {!isPercentual && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  )}
                  <input
                    type="number"
                    step={isPercentual ? '0.1' : '0.01'}
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className={`w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${!isPercentual ? 'pl-10' : ''}`}
                  />
                  {isPercentual && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
