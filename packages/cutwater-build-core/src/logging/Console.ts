export class Console {
  public static create() {
    return new Console();
  }

  public static createNull() {
    return new Console(true);
  }

  private constructor(private readonly isNulled = false) {}

  public log(message?: any, ...optionalParams: any[]): void {
    if (!this.isNulled) {
      console.log(message, ...optionalParams);
    }
  }
}
