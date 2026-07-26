import { create } from 'zustand';
import { getFormDetails, createFormDetail, updateFormDetail, deleteFormDetail } from '../db/database';
import type { FormDetail } from '../db/schema';

interface FormState {
  formDetails: FormDetail[];
  loading: boolean;
  loadFormDetails: () => Promise<void>;
  saveFormDetail: (sense_type: string, description: string) => Promise<void>;
  updateFormDetail: (id: number, description: string) => Promise<void>;
  deleteFormDetail: (id: number) => Promise<void>;
}

export const useFormStore = create<FormState>((set) => ({
  formDetails: [],
  loading: false,
  loadFormDetails: async () => {
    set({ loading: true });
    try {
      const rows = await getFormDetails() as FormDetail[];
      set({ formDetails: rows });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  saveFormDetail: async (sense_type, description) => {
    set({ loading: true });
    try {
      await createFormDetail(sense_type, description);
      const rows = await getFormDetails() as FormDetail[];
      set({ formDetails: rows });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateFormDetail: async (id, description) => {
    set({ loading: true });
    try {
      await updateFormDetail(id, description);
      const rows = await getFormDetails() as FormDetail[];
      set({ formDetails: rows });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteFormDetail: async (id) => {
    set({ loading: true });
    try {
      await deleteFormDetail(id);
      const rows = await getFormDetails() as FormDetail[];
      set({ formDetails: rows });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
