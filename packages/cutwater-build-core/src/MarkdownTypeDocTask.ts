import { TypeDocConfig, TypeDocTask } from './TypeDocTask';

// tslint:disable-next-line: interface-name
export interface MarkdownTypeDocConfig extends TypeDocConfig {
    mdEngine?: 'github' | 'bitbucket' | 'gitbook';
    mdDocusaurus?: boolean;
    mdHideSources?: boolean;
    mdSourceRepo?: string;
}

export class MarkdownTypeDocTask extends TypeDocTask<MarkdownTypeDocConfig> {
    constructor(packageName?: string) {
        super(packageName);
        this.name = 'markdown-typedoc';
        this.setConfig({theme: 'markdown'});
    }
}