import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ fullPage = false, className, text }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={cn('h-8 w-8 animate-spin text-brand-500', className)} />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={cn('h-6 w-6 animate-spin text-brand-500', className)} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
