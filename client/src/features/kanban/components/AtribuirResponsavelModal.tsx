import { useState } from 'react';
import type { Projeto, Etapa, Usuario } from '@/types/global.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AtribuirResponsavelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
  etapa: Etapa | null;
  usuarios: Usuario[];
  onAtribuir: (etapaId: string, usuarioId: string, usuarioNome: string, usuarioEmail: string) => Promise<void>;
  isLoading?: boolean;
}

export function AtribuirResponsavelModal({
  open,
  onOpenChange,
  projeto,
  etapa,
  usuarios,
  onAtribuir,
  isLoading = false,
}: AtribuirResponsavelModalProps) {
  const [selectedUsuario, setSelectedUsuario] = useState<string>('');

  const handleAtribuir = async () => {
    if (!selectedUsuario || !etapa) return;

    const usuario = usuarios.find((u) => u.id === selectedUsuario);
    if (!usuario) return;

    try {
      await onAtribuir(etapa.id, usuario.id, usuario.nome, usuario.email);
      setSelectedUsuario('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atribuir responsável:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Responsável</DialogTitle>
        </DialogHeader>

        {projeto && etapa && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Projeto</Label>
              <p className="font-semibold">{projeto.clienteFinal.nome}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Etapa</Label>
              <p className="font-semibold">{etapa.label}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario">Responsável</Label>
              <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
                <SelectTrigger id="usuario">
                  <SelectValue placeholder="Selecionar usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome} ({usuario.perfil})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUsuario('');
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAtribuir}
                disabled={!selectedUsuario || isLoading}
                loading={isLoading}
              >
                Atribuir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
