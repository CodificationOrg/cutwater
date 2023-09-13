import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import * as tmp from 'tmp';

import { FileSystem } from './FileSystem';
import { fileSystemTests } from './FileSystemTests.test';

fileSystemTests({
  generateRootPath: () => tmp.dirSync({ unsafeCleanup: true }).name,
  generateFileSystem: (rootPath, entries) => {
    entries.forEach((entry) => {
      const dir = !entry.content
        ? resolve(rootPath, entry.name)
        : dirname(resolve(rootPath, entry.name));
      mkdirSync(dir, { recursive: true });
    });
    entries.forEach((entry) => {
      if (entry.content) {
        writeFileSync(
          resolve(rootPath, entry.name),
          Buffer.from(entry.content)
        );
      }
    });
    return FileSystem.create();
  },
});
