export interface PackageJSON {
  name?: string;
  version?: string;
  main?: string;
  workspaces?: string[] | Record<string, string[]>;
  resolutions?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  directories:
    | {
        packagePath: string | undefined;
      }
    | undefined;
}
