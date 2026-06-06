import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  configuracoesService,
  type ConfigEtapas,
  type PermissoesPerfil,
  type ConfigNotificacoes,
  type PerfilUsuario,
  type ConfigEmpresa,
  type ConfigFeriados,
} from '@/features/configuracoes/services/configuracoesService';

// Get all configurations
export function useConfiguracoes() {
  return useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => configuracoesService.getConfiguracoes(),
  });
}

// Get stage configurations
export function useEtapas() {
  return useQuery({
    queryKey: ['configuracoes', 'etapas'],
    queryFn: () => configuracoesService.getEtapas(),
  });
}

// Update stage configurations
export function useUpdateEtapas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (etapas: ConfigEtapas) => configuracoesService.updateEtapas(etapas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'etapas'] });
    },
  });
}

// Get permission configurations
export function usePermissoes() {
  return useQuery({
    queryKey: ['configuracoes', 'permissoes'],
    queryFn: () => configuracoesService.getPermissoes(),
  });
}

// Update permission configurations
export function useUpdatePermissoes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissoes: Record<PerfilUsuario, PermissoesPerfil>) =>
      configuracoesService.updatePermissoes(permissoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'permissoes'] });
    },
  });
}

// Get notification configurations
export function useNotificacoes() {
  return useQuery({
    queryKey: ['configuracoes', 'notificacoes'],
    queryFn: () => configuracoesService.getNotificacoes(),
  });
}

// Update notification configurations
export function useUpdateNotificacoes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificacoes: ConfigNotificacoes) =>
      configuracoesService.updateNotificacoes(notificacoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'notificacoes'] });
    },
  });
}

// Get company info
export function useEmpresa() {
  return useQuery({
    queryKey: ['configuracoes', 'empresa'],
    queryFn: () => configuracoesService.getEmpresa(),
  });
}

// Update company info
export function useUpdateEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (empresa: ConfigEmpresa) => configuracoesService.updateEmpresa(empresa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'empresa'] });
    },
  });
}

// Get holidays
export function useFeriados() {
  return useQuery({
    queryKey: ['configuracoes', 'feriados'],
    queryFn: () => configuracoesService.getFeriados(),
  });
}

// Update holidays
export function useUpdateFeriados() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feriados: ConfigFeriados) => configuracoesService.updateFeriados(feriados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'feriados'] });
    },
  });
}
