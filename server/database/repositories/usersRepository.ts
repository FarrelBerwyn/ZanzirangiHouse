import { getDatabaseAdapter } from '../index.ts';
import { UserRecord } from '../adapter.ts';

export class UsersRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return getDatabaseAdapter().findUserByEmail(email);
  }

  async findById(id: string): Promise<UserRecord | null> {
    return getDatabaseAdapter().findUserById(id);
  }

  async save(user: UserRecord): Promise<void> {
    return getDatabaseAdapter().saveUser(user);
  }

  async create(user: UserRecord): Promise<UserRecord> {
    return getDatabaseAdapter().createUser(user);
  }

  async update(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    return getDatabaseAdapter().updateUser(id, data);
  }

  async disable(id: string): Promise<void> {
    return getDatabaseAdapter().disableUser(id);
  }

  async enable(id: string): Promise<void> {
    return getDatabaseAdapter().enableUser(id);
  }

  async resetPassword(id: string, newPasswordHash: string): Promise<void> {
    return getDatabaseAdapter().resetPassword(id, newPasswordHash);
  }

  async getActiveCount(): Promise<number> {
    return getDatabaseAdapter().getActiveUserCount();
  }

  async list(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
    return getDatabaseAdapter().listUsers();
  }
}

export const usersRepository = new UsersRepository();
