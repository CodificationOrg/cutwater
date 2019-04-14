import * as fs from 'fs';
import * as path from 'path';

import { GulpTask } from '@microsoft/gulp-core-build';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface ApiDocumenterToDocusaurusConfig {
  folder: string;
}

/**
 * @beta
 */
export class ApiDocumenterToDocusaurusTask extends GulpTask<
  ApiDocumenterToDocusaurusConfig
> {
  constructor(docsFolder?: string) {
    super('api-documenter-to-docusaurus', {
      folder: docsFolder ? docsFolder : './temp/docs'
    });
  }

  public executeTask(): Promise<void> {
    const directoryPath: string = path.resolve(this.taskConfig.folder);
    this.log(`Processing documentation folder: ${directoryPath}`);
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          reject(err);
        }
        Promise.all(
          files.map(file => {
            this.processFile(path.resolve(directoryPath, file));
          })
        )
          .then(() => resolve())
          .catch(procErr => reject(procErr));
      });
    });
  }

  private toLines(fileContent: string): string[] {
    return fileContent.split('\n');
  }

  private isApiDocumenterFile(lines: string[]): boolean {
    return lines.length >= 3 && lines[0].indexOf('[Home](./index) &gt;') === 0;
  }

  private toId(file: string): string {
    let rval: string = path.basename(file).replace('.md', '');
    const prefixIndex: number = rval.indexOf('.');
    if (prefixIndex !== -1) {
      rval = rval.substr(rval.indexOf('.') + 1).replace(/\.|_/g, '-');
    }
    return rval;
  }

  private processFile(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: 'utf8' }, (readErr, content) => {
        if (readErr) {
          reject(readErr);
        } else {
          const lines: string[] = this.toLines(content);
          if (this.isApiDocumenterFile(lines)) {
            fs.writeFile(
              file,
              this.parseAndConvert(this.toId(file), lines),
              writeErr => {
                if (writeErr) {
                  reject(writeErr);
                } else {
                  resolve();
                }
              }
            );
          } else {
            resolve();
          }
        }
      });
    });
  }

  private toTitle(headerTitle: string): string {
    let rval: string = headerTitle.substr(3).replace(/\\_/g, '_');
    const lastWord: string = rval.substr(rval.lastIndexOf(' ') + 1);
    rval = rval.replace(
      lastWord,
      `${lastWord.substr(0, 1).toUpperCase()}${lastWord.substr(1)}`
    );
    return rval;
  }

  private toHeader(id: string, title: string): string[] {
    const rval: string[] = ['---'];
    rval.push(`id: ${id}`);
    rval.push(`title: ${title}`);
    rval.push('---');
    return rval;
  }

  private parseAndConvert(id: string, lines: string[]): Buffer {
    const header: string[] = this.toHeader(id, this.toTitle(lines[2]));
    lines.splice(1, 2);
    return Buffer.from([...header, ...lines].join('\n'), 'utf8');
  }
}
