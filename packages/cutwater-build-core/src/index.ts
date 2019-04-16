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
