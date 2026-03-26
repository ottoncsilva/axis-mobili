import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDestructive = variant === 'destructive';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-destructive/10' : 'bg-brand-600/10'}`}>
              {isDestructive ? (
                <Trash2 className="h-5 w-5 text-destructive" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-brand-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 ${
                isDestructive
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? 'Aguarde...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
