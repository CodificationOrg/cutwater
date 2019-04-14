import { ApiDocumenterConfig, ApiDocumenterTask } from './ApiDocumenterTask';
import {
  MarkdownTypeDocConfig,
  MarkdownTypeDocTask
} from './MarkdownTypeDocTask';
import { TypeDocConfig, TypeDocTask } from './TypeDocTask';

export { ApiDocumenterTask, ApiDocumenterConfig };
export { TypeDocConfig, TypeDocTask };
export { MarkdownTypeDocTask, MarkdownTypeDocConfig };

/**
 * @beta
 */
export const typeDoc: TypeDocTask<TypeDocConfig> = new TypeDocTask();

/**
 * @beta
 */
export const mdTypeDoc: MarkdownTypeDocTask = new MarkdownTypeDocTask();
