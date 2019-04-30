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
 * Registers various tasks for use during common CI usage scenarios using the package name
 * (without the scope, if present) to determine the output location.
 *
 * - __cutwater-ci-docs__: Generates [__Docusaurus__](https://docusaurus.io/) style documentation from TypeDoc comments
 * - __cutwater-ci-typedocs__: Generates default style documentaiton using TypeDoc
 * - __cutwater-ci-mdtypedocs__: Generates documentation from TypeDoc comment in the Markdown format
 * - __cutwater-ci-tslint__: Runs TSLint and send output to a junit formatted file
 * - __cutwater-ci-jest__: Runs [__jest__](https://jestjs.io/) unit tests, sending output to a junit formatted file
 *
 * @beta
 */
export const registerCiTasks: Function = (packageObj: {}): void => {
  // tslint:disable-next-line: no-string-literal
  const packageName: string = packageObj['name'];
  task('cutwater-ci-docs', mdTypeDoc(packageName, true));
  task('cutwater-ci-typedocs', typeDoc(packageName));
  task('cutwater-ci-mdtypedocs', mdTypeDoc(packageName));
  task('cutwater-ci-tslint', new TSLintTask(packageName));
  task('cutwater-ci-jest', serial(tscTask, new JestTask(packageName)));
};
