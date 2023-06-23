import { SchemaDefinition } from 'js-yaml';

export interface FileReference {
  readonly path: string;
  exists(): boolean;
  isFile(): boolean;
  isDirectory(): boolean;
  children(): FileReference[];
  delete(recursive?: boolean): FileReference;
  copyTo(destination: FileReference): FileReference;
  readObjectSyncSafe<T>(schema?: SchemaDefinition): T;
  readObjectSync<T>(schema?: SchemaDefinition): T | undefined;
  read(): string;
  replaceTokens(values: Record<string, string>): FileReference;
  writeObjectSync(obj: unknown, schema?: SchemaDefinition): FileReference;
  write(value: string): FileReference;
}
