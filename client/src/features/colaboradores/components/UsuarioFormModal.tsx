import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useUsuariosMutation } from '../hooks/useUsuarios';
import type { Usuario, UsuarioFormData } from '../types/usuarios.types';
import { maskTelefone } from '@/lib/masks';
import { X, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  usuario?: Usuario;
}

const PERFIS: Array<{ value: string; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'projetista', label: 'Projetista' },
  { value: 'medidor', label: 'Medidor' },
  { value: 'financeiro', label: 'Financeiro' },
];

const defaultFormData: UsuarioFormData = {
  nome: '',
  email: '',
  perfil: 'projetista',
  telefone: '',
};

export function UsuarioFormModal({ open, onClose, usuario }: Props) {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [senhaCopied, setSenhaCopied] = useState(false);
  const [senhaTemp, setSenhaTemp] = useState('');
  const { criar, atualizar } = useUsuariosMutation();
  const isEditing = !!usuario;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    defaultValues: defaultFormData,
  });

  useEffect(() => {
    if (open) {
      if (usuario) {
        reset({
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          telefone: usuario.telefone || '',
        });
        setSenhaTemp('');
      } else {
        reset(defaultFormData);
        setSenhaTemp('');
      }
      setSenhaCopied(false);
    }
  }, [open, usuario, reset]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (isEditing) {
        await atualizar.mutateAsync({ id: usuario!.id, data });
        setToast({ type: 'success', message: 'Usuário atualizado com sucesso!' });
      } else {
        const response = await criar.mutateAsync(data);
        setSenhaTemp(response.senhaTemporaria || '');
        setToast({ type: 'success', message: 'Usuário criado com sucesso!' });
      }
      setTimeout(() => onClose(), isEditing ? 500 : 0);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Erro ao salvar' });
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:w-full z-50 flex items-start justify-center overflow-y-auto">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full animate-fade-in">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-all">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome *</label>
                  <input
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    placeholder="Nome completo"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <input
                    {...register('email', { required: 'Email é obrigatório' })}
                    type="email"
                    placeholder="email@exemplo.com"
                    disabled={isEditing}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Perfil *</label>
                  <Controller
                    name="perfil"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {PERFIS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                        placeholder="(XX) XXXXX-XXXX"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  />
                </div>
              </div>

              {!isEditing && senhaTemp && (
                <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50">
                  <p className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-2">
                    Senha Temporária
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded bg-background text-foreground font-mono text-sm">
                      {senhaTemp}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(senhaTemp);
                        setSenhaCopied(true);
                        setTimeout(() => setSenhaCopied(false), 2000);
                      }}
                      className="p-2 rounded-lg hover:bg-brand-600/10 transition-all"
                    >
                      {senhaCopied ? (
                        <Check className="h-4 w-4 text-brand-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-brand-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-brand-700 dark:text-brand-300 mt-2">
                    Compartilhe com o usuário para acesso inicial. Ele deverá alterar na primeira conexão.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 shadow-md shadow-brand-600/20"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </form>

          {toast && (
            <div
              className={cn(
                'fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in',
                toast.type === 'success' ? 'bg-brand-600 text-white' : 'bg-destructive text-white'
              )}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
