import { BaseExecTask } from './BaseExecTask';
import { BuildUtils } from './BuildUtils';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface TSLintConfig {
  file?: string;
  config?: string;
  exclude?: string[];
  fix?: boolean;
  force?: boolean;
  init?: boolean;
  out?: string;
  outputAbsolutePaths?: boolean;
  'rules-dir'?: string;
  'formatters-dir'?: string;
  format?: string;
  quiet?: boolean;
  test?: boolean;
  project?: string;
}

/**
 * @beta
 */
export class TSLintTask extends BaseExecTask<TSLintConfig> {
  public constructor(packageName?: string) {
    super('tslint', 'cutwater-tslint', { file: 'src/**/*.ts' }, false, 'file');
    if (packageName) {
      this.setConfig({
        format: 'junit',
        out: `../../reports/junit/${BuildUtils.toSimplePackageName(
          packageName
        )}-lint-results.xml`
      });
    }
  }
}
