export type UserProfile = {
  id: number;
  email: string;
  username: string;
  fullName: string;
  cpf: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};
