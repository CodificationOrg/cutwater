/**
 * Defines a set of standard logging levels that can be used to control logging output.
 * The logging Level objects are ordered and are specified by ordered integers. Enabling logging at a given
 * level also enables logging at all higher levels.
 */
export class Level {
  /**
   * Level inidicating all logging is disabled.
   * @readonly
   */
  public static readonly OFF = new Level('OFF', 0);
  /**
   * Level indicating only fatal messages will be output.
   * @readonly
   */
  public static readonly FATAL = new Level('FATAL', 1);
  /**
   * Level indicating only error messages or worse will be output.
   * @readonly
   */
  public static readonly ERROR = new Level('ERROR', 2);
  /**
   * Level indicating only warning messages or worse will be output.
   * @readonly
   */
  public static readonly WARN = new Level('WARN', 3);
  /**
   * Level indicating only info messages or worse will be output.
   * @readonly
   */
  public static readonly INFO = new Level('INFO', 4);
  /**
   * Level indicating only debug messages or worse will be output.
   * @readonly
   */
  public static readonly DEBUG = new Level('DEBUG', 5);
  /**
   * Level indicating trace messages or worse will be output.
   * @readonly
   */
  public static readonly TRACE = new Level('TRACE', 6);
  /**
   * Level indicating that ALL messages will be output.
   * @readonly
   */
  public static readonly ALL = new Level('ALL', 7);

  /**
   * An array containing all [[Level]]s.
   * @readonly
   */
  public static readonly LEVELS = [Level.FATAL, Level.ERROR, Level.WARN, Level.INFO, Level.DEBUG, Level.TRACE];

  /**
   * Returns a [[Level]] object representing the `string` or `number` speicified.
   *
   * @param level - A value corresponding to a [[Level]].
   */
  public static toLevel(level: string | number): Level {
    let rval: Level;
    if (typeof level === 'number' && level >= this.OFF.priority && level <= this.ALL.priority) {
      rval = this.ALL_LEVELS[level];
    } else if (typeof level === 'string') {
      rval = this.ALL_LEVELS.find(lvl => lvl.name === level.toUpperCase());
    }
    return rval;
  }

  private static readonly ALL_LEVELS = [Level.OFF, ...Level.LEVELS, Level.ALL];

  private levelName: string;
  private levelPriority: number;

  private constructor(name: string, priority: number) {
    this.levelName = name;
    this.levelPriority = priority;
  }

  /**
   * Human readable name of this [[Level]].
   *
   * @readonly
   */
  get name(): string {
    return this.levelName;
  }

  /**
   * The numeric priority of this [[Level]].  Higher values indicate a higher level of detail.
   *
   * @readonly
   */
  get priority(): number {
    return this.levelPriority;
  }

  /**
   * Returns `true` if this [[Level]] is greater or equal to the priority of the supplied level.
   *
   * @param level - The level to be compared.
   * @returns {boolean}
   */
  public isGreaterOrEqual(level: Level): boolean {
    return this.priority >= level.priority;
  }
}
