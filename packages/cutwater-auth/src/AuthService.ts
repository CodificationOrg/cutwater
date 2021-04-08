export interface AuthService<T, E> {
  getUserId(req: T): Promise<string | undefined>;
  setUserId(res: E, userId?: string): Promise<void>;
}