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

  private processFile(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: 'utf8' }, (readErr, content) => {
        if (readErr) {
          reject(readErr);
        } else {
          this.log(`Writing file: ${file}`);
          fs.writeFile(
            file,
            this.parseAndConvert(path.basename(file), content),
            writeErr => {
              if (writeErr) {
                reject(writeErr);
              } else {
                resolve();
              }
            }
          );
        }
      });
    });
  }

  private toLines(fileContent: string): string[] {
    return fileContent.split('\n');
  }

  private isApiDocumenterFile(lines: string[]): boolean {
    return lines.length >= 3 && lines[0].indexOf('[Home](./index) &gt;') === 0;
  }

  private toId(fileName: string): string {
    return fileName.replace('.md', '').replace(/\.|_/g, '-');
  }

  private toTitle(headerTitle: string): string {
    const rval: string = headerTitle.substr(3).replace(/\\_/g, '_');
    const lastWord: string = rval.substr(rval.lastIndexOf(' ') + 1);
    return rval.replace(
      lastWord,
      `${lastWord.substr(0, 1).toUpperCase()}${lastWord.substr(1)}`
    );
  }

  private toHeader(fileName: string, heading: string): string[] {
    const rval: string[] = ['---'];
    rval.push(`id: ${this.toId(fileName)}`);
    rval.push(`title: ${this.toTitle(heading)}`);
    rval.push('---');
    return rval;
  }

  private parseAndConvert(fileName: string, fileContent: string): Buffer {
    let rval: string = fileContent;
    const lines: string[] = this.toLines(fileContent);
    if (this.isApiDocumenterFile(lines)) {
      const header: string[] = this.toHeader(fileName, lines[2]);
      lines.splice(1, 2);
      rval = [...header, ...lines].join('\n');
    }
    return Buffer.from(rval, 'utf8');
  }
}
