import { adminDb } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

export const clientesService = {
  async listar(filtros?: { busca?: string; status?: string }) {
    let snapshot = await adminDb.collection('clientes').orderBy('nomeFantasia').get();
    let clientes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (filtros?.status && filtros.status !== 'todos') {
      const isAtivo = filtros.status === 'ativo';
      clientes = clientes.filter((c: any) => c.ativo === isAtivo);
    }

    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      clientes = clientes.filter((c: any) =>
        c.nomeFantasia?.toLowerCase().includes(busca) ||
        c.razaoSocial?.toLowerCase().includes(busca) ||
        c.cnpj?.includes(filtros.busca!.replace(/\D/g, ''))
      );
    }

    return clientes;
  },

  async buscarPorId(id: string) {
    const doc = await adminDb.collection('clientes').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async criar(data: any) {
    const cnpj = (data.cnpj || '').replace(/\D/g, '');

    // Verify unique CNPJ
    if (cnpj) {
      const existing = await adminDb.collection('clientes')
        .where('cnpj', '==', cnpj)
        .get();
      if (!existing.empty) {
        throw new Error('CNPJ já cadastrado no sistema');
      }
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection('clientes').add({
      ...data,
      cnpj,
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    });

    return docRef.id;
  },

  async atualizar(id: string, data: any) {
    await adminDb.collection('clientes').doc(id).update({
      ...data,
      atualizadoEm: FieldValue.serverTimestamp(),
    });
  },

  async toggleAtivo(id: string, ativo: boolean) {
    await adminDb.collection('clientes').doc(id).update({
      ativo,
      atualizadoEm: FieldValue.serverTimestamp(),
    });
  },
};
