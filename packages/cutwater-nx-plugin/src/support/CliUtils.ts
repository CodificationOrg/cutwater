import { CliOptions } from '../types/CliOptions';
import { CommandOptions } from '../types/CommandOptions';
import { TextUtils } from './TextUtils';

export class CliUtils {
  public static prepareArgs(
    config: CliOptions<unknown, unknown>,
    cmdOpts?: CommandOptions
  ): string {
    const cmd = CliUtils.preparedCommand(cmdOpts?.command, cmdOpts?.subCommand);
    const opts = CliUtils.preparedOptions(config, cmdOpts?.filteredParams);
    const params = CliUtils.preparedParameters(config, cmdOpts?.filteredParams);
    const args = config.args ? ' ' + config.args.join(' ') : '';
    return `${cmd}${opts}${params}${args}`;
  }

  protected static preparedCommand(command = '', subCommand = ''): string {
    return command ? `${command}${subCommand ? ' ' + subCommand : ''} ` : '';
  }

  protected static preparedOptions(
    config: CliOptions<unknown, unknown>,
    filteredParams?: string[]
  ): string {
    return config.options
      ? CliUtils.toArgString(config.options, filteredParams)
      : '';
  }

  protected static toArgString(
    args: unknown,
    filteredParams: string[] = []
  ): string {
    const argArray: string[] = Object.keys(args)
      .filter((property) => !filteredParams.includes(property))
      .map((property) => {
        const value = args[property];
        const arg = TextUtils.convertPropertyNameToArg(property);
        if (typeof value === 'string') {
          return `${arg} "${value}"`;
        } else if (typeof value === 'boolean' && !!value) {
          return arg;
        } else if (typeof value === 'number') {
          return `${arg} ${value}`;
        } else if (Array.isArray(value)) {
          return `${arg} ${CliUtils.toParameterList(value)}`;
        } else if (typeof value === 'object') {
          return `${arg} '${JSON.stringify(value)}'`;
        }
        return '';
      });
    return ` ${argArray.join(' ')}`;
  }

  protected static toParameterList(arg: unknown[]): string {
    return arg
      .map((value) => {
        if (typeof value === 'string') {
          return `"${value}"`;
        } else if (typeof value === 'number') {
          return value;
        }
        return '';
      })
      .join(' ');
  }

  protected static preparedParameters(
    config: CliOptions<unknown, unknown>,
    filteredParams?: string[]
  ): string {
    return config.parameters
      ? CliUtils.toArgString(config.parameters, filteredParams)
      : '';
  }
}
