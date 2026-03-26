import { Controller, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { maskTelefone } from '@/lib/masks';
import { Trash2 } from 'lucide-react';
import type { ClienteFormData } from '../types/clientes.types';

interface ContatoFormProps {
  index: number;
  control: Control<ClienteFormData>;
  register: UseFormRegister<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function ContatoForm({ index, control, register, errors, onRemove, canRemove }: ContatoFormProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">Contato {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Remover contato"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nome *</label>
          <input
            {...register(`contatos.${index}.nome`, { required: 'Obrigatório' })}
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.contatos?.[index]?.nome && (
            <p className="text-xs text-destructive">{errors.contatos[index]?.nome?.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Cargo *</label>
          <input
            {...register(`contatos.${index}.cargo`, { required: 'Obrigatório' })}
            placeholder="Ex: Vendedor, Gerente..."
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            {...register(`contatos.${index}.email`, {
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
            type="email"
            className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.contatos?.[index]?.email && (
            <p className="text-xs text-destructive">{errors.contatos[index]?.email?.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Telefone *</label>
          <Controller
            name={`contatos.${index}.telefone`}
            control={control}
            rules={{ required: 'Obrigatório' }}
            render={({ field }) => (
              <input
                {...field}
                onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          />
          {errors.contatos?.[index]?.telefone && (
            <p className="text-xs text-destructive">{errors.contatos[index]?.telefone?.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
          <Controller
            name={`contatos.${index}.whatsapp`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                className="w-full h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register(`contatos.${index}.principal`)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Contato principal</span>
          </label>
        </div>
      </div>
    </div>
  );
}
