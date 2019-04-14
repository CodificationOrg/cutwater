import { TypeDocConfig } from './BaseTypeDocTask';
import {
  MarkdownTypeDocConfig,
  MarkdownTypeDocTask
} from './MarkdownTypeDocTask';
import { TypeDocTask } from './TypeDocTask';

export { TypeDocConfig, TypeDocTask };
export { MarkdownTypeDocTask, MarkdownTypeDocConfig };

/**
 * @beta
 */
// tslint:disable-next-line: typedef
export const typeDoc = (packageName?: string): TypeDocTask =>
  new TypeDocTask(packageName);

/**
 * @beta
 */
// tslint:disable-next-line: typedef
export const mdTypeDoc = (
  packageName?: string,
  docusaurus: boolean = false
): MarkdownTypeDocTask => {
  const rval: MarkdownTypeDocTask = new MarkdownTypeDocTask(packageName);
  if (docusaurus) {
    rval.setConfig({ mdDocusaurus: true });
  }
  return rval;
};
