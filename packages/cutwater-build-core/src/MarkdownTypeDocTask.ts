import { BaseTypeDocTask, TypeDocConfig } from './BaseTypeDocTask';
import { defaultConfig } from './TypeDocTask';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface MarkdownTypeDocConfig extends TypeDocConfig {
  mdEngine?: 'github' | 'bitbucket' | 'gitbook';
  mdDocusaurus?: boolean;
  mdHideSources?: boolean;
  mdSourceRepo?: string;
}

/**
 * @beta
 */
export class MarkdownTypeDocTask extends BaseTypeDocTask<
  MarkdownTypeDocConfig
> {
  constructor(packageName?: string) {
    super('cutwater-markdown-typedoc', defaultConfig(packageName));
    this.setConfig({ theme: 'markdown' });
  }
}
