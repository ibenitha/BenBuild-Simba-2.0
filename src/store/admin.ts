import { create } from 'zustand';
import { DemoUser } from './auth';

const ADMIN_EMAILS = [
  'admin@simba.rw',
  'manager@simba.rw',
  'ops@simba.rw'
];

interface AdminStore {
  isAdmin: (user: DemoUser | null) => boolean;
}

export const useAdminStore = create<AdminStore>()((set, get) => ({
  isAdmin: (user) => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
  }
}));
