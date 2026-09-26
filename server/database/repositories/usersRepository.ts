import { getDatabaseAdapter } from '../index.ts';
import { UserRecord } from '../adapter.ts';

export class UsersRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return getDatabaseAdapter().findUserByEmail(email);
  }

  async save(user: UserRecord): Promise<void> {
    return getDatabaseAdapter().saveUser(user);
  }

  async list(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
    return getDatabaseAdapter().listUsers();
  }
}

export const usersRepository = new UsersRepository();
