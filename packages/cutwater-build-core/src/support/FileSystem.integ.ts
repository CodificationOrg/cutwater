import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import tmp from 'tmp';

import { FileSystem } from './FileSystem';
import { fileSystemTests } from './FileSystemTests';

fileSystemTests({
  generateRootPath: () => tmp.dirSync({ unsafeCleanup: true }).name,
  generateFileSystem: (rootPath, entries) => {
    console.log(rootPath);
    entries.forEach((entry) => {
      if (!entry.content) {
        mkdirSync(resolve(rootPath, entry.name), { recursive: true });
      }
    });
    entries.forEach((entry) => {
      if (entry.content) {
        writeFileSync(resolve(rootPath, entry.name), Buffer.from(entry.content));
      }
    });
    return FileSystem.create();
  },
});
