import { RunCommand } from './RunCommand';

export class EnvUtils {
  public static isCiBuild(): boolean {
    return !!process.env['CI'];
  }

  public static buildNumber(defaultValue: number): number {
    const rval: string | undefined = process.env['GITHUB_RUN_NUMBER'];
    return rval ? +rval : defaultValue;
  }

  public static attemptNumber(defaultValue: number): number {
    const rval: string | undefined = process.env['GITHUB_RUN_ATTEMPT'];
    return rval ? +rval : defaultValue;
  }

  public static async gitRev(): Promise<string> {
    return (
      await new RunCommand().run({
        quiet: true,
        command: 'git',
        args: 'rev-parse --verify HEAD',
      })
    )
      .toString()
      .trim();
  }
}
