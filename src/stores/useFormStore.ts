import { create } from 'zustand';
import { getFormDetails, createFormDetail, updateFormDetail, deleteFormDetail } from '../db/database';
import type { FormDetail } from '../db/schema';

interface FormState {
  formDetails: FormDetail[];
  loading: boolean;
  loadError: boolean;
  loadFormDetails: () => Promise<void>;
  saveFormDetail: (sense_type: string, description: string) => Promise<void>;
  updateFormDetail: (id: number, description: string) => Promise<void>;
  deleteFormDetail: (id: number) => Promise<void>;
}

export const useFormStore = create<FormState>((set) => {
  // 私有 helper：执行写操作后全量重载（与原始 save/update/delete 行为一致，含 rethrow）
  const mutate = async (fn: () => Promise<void>) => {
    set({ loading: true });
    try {
      await fn();
      const rows = await getFormDetails() as FormDetail[];
      set({ formDetails: rows, loadError: false });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  };

  return {
    formDetails: [],
    loading: false,
    loadError: false,
    loadFormDetails: async () => {
      set({ loading: true, loadError: false });
      try {
        const rows = await getFormDetails() as FormDetail[];
        set({ formDetails: rows, loadError: false });
      } catch (error) {
        console.error(error);
        set({ loadError: true });
      } finally {
        set({ loading: false });
      }
    },
    saveFormDetail: async (sense_type, description) => mutate(() => createFormDetail(sense_type, description)),
    updateFormDetail: async (id, description) => mutate(() => updateFormDetail(id, description)),
    deleteFormDetail: async (id) => mutate(() => deleteFormDetail(id)),
  };
});
