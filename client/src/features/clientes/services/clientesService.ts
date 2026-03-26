import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Cliente } from '@/types/global.types';
import type { ClienteFormData, ClientesFiltros } from '../types/clientes.types';
import { unmaskNumber } from '@/lib/masks';

const COLLECTION = 'clientes';

export const clientesService = {
  async listar(filtros?: ClientesFiltros): Promise<Cliente[]> {
    const q = query(collection(db, COLLECTION), orderBy('nomeFantasia'));
    const snapshot = await getDocs(q);

    let clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Cliente[];

    // Filtros client-side
    if (filtros) {
      if (filtros.status !== 'todos') {
        const isAtivo = filtros.status === 'ativo';
        clientes = clientes.filter((c) => c.ativo === isAtivo);
      }

      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        clientes = clientes.filter(
          (c) =>
            c.nomeFantasia.toLowerCase().includes(busca) ||
            c.razaoSocial.toLowerCase().includes(busca) ||
            c.cnpj.includes(unmaskNumber(busca)) ||
            c.endereco.cidade.toLowerCase().includes(busca)
        );
      }
    }

    return clientes;
  },

  async buscarPorId(id: string): Promise<Cliente | null> {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Cliente;
    }
    return null;
  },

  async criar(data: ClienteFormData): Promise<string> {
    const now = Timestamp.now();
    const docData = {
      ...data,
      cnpj: unmaskNumber(data.cnpj),
      endereco: {
        ...data.endereco,
        cep: unmaskNumber(data.endereco.cep),
      },
      contatos: data.contatos.map((c, index) => ({
        ...c,
        id: `contato_${Date.now()}_${index}`,
        telefone: unmaskNumber(c.telefone),
        whatsapp: c.whatsapp ? unmaskNumber(c.whatsapp) : undefined,
      })),
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return docRef.id;
  },

  async atualizar(id: string, data: Partial<ClienteFormData>): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    const updateData: Record<string, unknown> = {
      ...data,
      atualizadoEm: Timestamp.now(),
    };

    if (data.cnpj) {
      updateData.cnpj = unmaskNumber(data.cnpj);
    }
    if (data.endereco?.cep) {
      updateData.endereco = {
        ...data.endereco,
        cep: unmaskNumber(data.endereco.cep),
      };
    }
    if (data.contatos) {
      updateData.contatos = data.contatos.map((c, index) => ({
        ...c,
        id: `contato_${Date.now()}_${index}`,
        telefone: unmaskNumber(c.telefone),
        whatsapp: c.whatsapp ? unmaskNumber(c.whatsapp) : undefined,
      }));
    }

    await updateDoc(docRef, updateData);
  },

  async toggleAtivo(id: string, ativo: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ativo,
      atualizadoEm: Timestamp.now(),
    });
  },

  async listarParaSelect(): Promise<Array<{ id: string; nomeFantasia: string }>> {
    const q = query(collection(db, COLLECTION), orderBy('nomeFantasia'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nomeFantasia: data.nomeFantasia,
          ativo: data.ativo,
        };
      })
      .filter((c) => c.ativo)
      .map(({ id, nomeFantasia }) => ({ id, nomeFantasia }));
  },
};
