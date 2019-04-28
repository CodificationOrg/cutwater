import { IExecutable, serial, task } from '@microsoft/gulp-core-build';
import { tscCmd, tslintCmd } from '@microsoft/gulp-core-build-typescript';

import { TypeDocConfig } from './BaseTypeDocTask';
import { JestConfig, JestTask } from './JestTask';
import {
  MarkdownTypeDocConfig,
  MarkdownTypeDocTask
} from './MarkdownTypeDocTask';
import { TSLintConfig, TSLintTask } from './TSLintTask';
import { TypeDocTask } from './TypeDocTask';

export { TypeDocConfig, TypeDocTask };
export { MarkdownTypeDocTask, MarkdownTypeDocConfig };
export { JestConfig, JestTask };
export { TSLintConfig, TSLintTask };

/**
 * @beta
 */
export const typeDoc: Function = (packageName?: string): TypeDocTask =>
  new TypeDocTask(packageName);

/**
 * @beta
 */
export const mdTypeDoc: Function = (
  packageName?: string,
  docusaurus: boolean = false
): MarkdownTypeDocTask => {
  const rval: MarkdownTypeDocTask = new MarkdownTypeDocTask(packageName);
  rval.setConfig({ mdDocusaurus: docusaurus });
  return rval;
};

/**
 * @beta
 */
export const tscTask: IExecutable = task('tsc', tscCmd);
/**
 * @beta
 */
export const tsLintTask: IExecutable = task('tslint', tslintCmd);

/**
 * @beta
 */
export const registerCiTasks: Function = (packageObj: {}): void => {
  // tslint:disable-next-line: no-string-literal
  const packageName: string = packageObj['name'];
  task('cutwater-ci-tslint', new TSLintTask(packageName));
  task('cutwater-ci-jest', serial(tscTask, new JestTask(packageName)));
};
