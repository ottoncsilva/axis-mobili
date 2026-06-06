import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanService } from '../services/kanbanService';
import type { TipoServico, Projeto } from '@/types/global.types';

export function useProjetos(tipoServico: TipoServico) {
  return useQuery({
    queryKey: ['projetos', tipoServico],
    queryFn: () => kanbanService.getProjetos(tipoServico),
    refetchInterval: 15000, // Refetch a cada 15s
    refetchOnWindowFocus: true,
  });
}

export function useMoveProject(tipoServico: TipoServico) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projetoId, novaEtapa }: { projetoId: string; novaEtapa: string }) =>
      kanbanService.moveProject(projetoId, novaEtapa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos', tipoServico] });
    },
  });
}

export function useAtribuirResponsavel(tipoServico: TipoServico) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projetoId,
      etapaId,
      usuarioId,
      usuarioNome,
      usuarioEmail,
    }: {
      projetoId: string;
      etapaId: string;
      usuarioId: string;
      usuarioNome: string;
      usuarioEmail: string;
    }) =>
      kanbanService.atribuirResponsavel(projetoId, etapaId, usuarioId, usuarioNome, usuarioEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos', tipoServico] });
    },
  });
}

// Calcular alertas de SLA
export function useSLAAlertas(projetos: Projeto[] | undefined, diasAlerta: number = 2) {
  const alertas = new Set<string>();

  if (!projetos) return alertas;

  projetos.forEach((projeto) => {
    const etapaAtual = projeto.etapas?.find((e) => e.nome === projeto.etapaAtual);
    if (etapaAtual && etapaAtual.sla > 0 && etapaAtual.sla <= diasAlerta) {
      alertas.add(projeto.id);
    }
  });

  return alertas;
}
