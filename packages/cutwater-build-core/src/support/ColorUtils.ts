import chalk, { Chalk } from 'chalk';

export const duration = (value: string): string => {
  return colorize(chalk.magenta, value);
};

export const label = (value: string): string => {
  return colorize(chalk.cyan, value);
};

export const msg = (value: string): string => {
  return colorize(chalk.gray, value);
};

export const success = (value: string): string => {
  return colorize(chalk.green, value);
};

export const warn = (value: string): string => {
  return info(value);
};

export const info = (value: string): string => {
  return colorize(chalk.yellow, value);
};

export const failure = (value: string): string => {
  return error(value);
};

export const error = (value: string): string => {
  return colorize(chalk.red, value);
};

const colorize = (color: Chalk, value: string): string => {
  return color(value);
};
