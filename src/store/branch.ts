import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { simbaBranches, Branch } from '@/lib/branches';

interface BranchStore {
  selectedBranchId: string;
  setBranchId: (id: string) => void;
  getSelectedBranch: () => Branch;
}

export const useBranchStore = create<BranchStore>()(
  persist(
    (set, get) => ({
      selectedBranchId: simbaBranches[0].id,
      setBranchId: (id: string) => set({ selectedBranchId: id }),
      getSelectedBranch: () => {
        const id = get().selectedBranchId;
        return simbaBranches.find(b => b.id === id) || simbaBranches[0];
      },
    }),
    {
      name: 'simba-branch-selection',
    }
  )
);
