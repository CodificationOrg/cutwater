import { resolve } from 'path';

import { FileSystem } from './FileSystem';
import { fileSystemTests } from './FileSystemTests';

fileSystemTests({
  generateRootPath: () => resolve('/'),
  generateFileSystem: (rootPath, entries) => {
    return FileSystem.createNull(entries);
  },
});
