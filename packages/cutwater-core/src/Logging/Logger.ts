import { Appender } from './Appender';
import { Level } from './Level';

export interface Logger {
  name: string;
  level: Level;
  appender: Appender;
  isEnabled(Level: Level): boolean;
  fatal(...input: any[]): boolean;
  error(...input: any[]): boolean;
  warn(...input: any[]): boolean;
  info(...input: any[]): boolean;
  debug(...input: any[]): boolean;
  trace(...input: any[]): boolean;
  log(...input: any[]): boolean;
}
