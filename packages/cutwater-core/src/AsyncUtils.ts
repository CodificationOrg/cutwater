export class AsyncUtils {
  public static async wait(milliseconds: number): Promise<void> {
    return await new Promise((res) => setTimeout(res, milliseconds));
  }
}
