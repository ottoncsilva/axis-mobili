import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import type { ProjetoFormData } from '../types/projetos.types';

interface Props {
  index: number;
  register: UseFormRegister<ProjetoFormData>;
  errors: FieldErrors<ProjetoFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function AmbienteForm({ index, register, errors, onRemove, canRemove }: Props) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Ambiente {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Remover ambiente"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Nome do ambiente *</label>
          <input
            {...register(`ambientes.${index}.nome`, {
              required: 'Nome do ambiente é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            })}
            placeholder="Ex: Cozinha, Sala de Estar, Quarto..."
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.ambientes?.[index]?.nome && (
            <p className="text-xs text-destructive">{errors.ambientes[index]?.nome?.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Observações</label>
          <input
            {...register(`ambientes.${index}.observacoes`)}
            placeholder="Observações sobre este ambiente..."
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
