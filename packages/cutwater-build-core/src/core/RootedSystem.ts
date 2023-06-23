import { isAbsolute, join, resolve } from 'path';
import yargs from 'yargs';

import { FileSystem } from './FileSystem';
import { Process } from './Process';
import { System } from './System';

export class RootedSystem extends System {
  public static createRootedSystem(rootPath: string): RootedSystem {
    return new RootedSystem(
      rootPath,
      Process.create(),
      FileSystem.create(),
      yargs.argv as Record<string, string | boolean>,
    );
  }

  public static createNullRootedSystem(
    rootPath: string,
    args: Record<string, string | boolean> = {},
    process: Process = Process.createNull(),
    fileSystem: FileSystem = FileSystem.createNull(),
  ): RootedSystem {
    return new RootedSystem(rootPath, process, fileSystem, args);
  }

  protected constructor(
    public readonly rootPath: string,
    process: Process,
    fileSystem: FileSystem,
    args: Record<string, string | boolean>,
  ) {
    super(process, fileSystem, args);
  }

  protected resolvePath(path: string): string {
    let rval: string = resolve(path);
    if (!isAbsolute(path) && this.rootPath) {
      rval = resolve(join(this.rootPath, path));
    }
    return rval;
  }
}
