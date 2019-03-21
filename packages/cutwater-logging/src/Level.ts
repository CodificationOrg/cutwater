/**
 * Defines a set of standard logging levels that can be used to control logging output.
 * The logging Level objects are ordered and are specified by ordered integers. Enabling logging at a given
 * level also enables logging at all higher levels.
 *
 * @beta
 */
export class Level {
  /**
   * Level inidicating all logging is disabled.
   * @readonly
   */
  public static readonly OFF: Level = new Level('OFF', 0);
  /**
   * Level indicating only fatal messages will be output.
   * @readonly
   */
  public static readonly FATAL: Level = new Level('FATAL', 1);
  /**
   * Level indicating only error messages or worse will be output.
   * @readonly
   */
  public static readonly ERROR: Level = new Level('ERROR', 2);
  /**
   * Level indicating only warning messages or worse will be output.
   * @readonly
   */
  public static readonly WARN: Level = new Level('WARN', 3);
  /**
   * Level indicating only info messages or worse will be output.
   * @readonly
   */
  public static readonly INFO: Level = new Level('INFO', 4);
  /**
   * Level indicating only debug messages or worse will be output.
   * @readonly
   */
  public static readonly DEBUG: Level = new Level('DEBUG', 5);
  /**
   * Level indicating trace messages or worse will be output.
   * @readonly
   */
  public static readonly TRACE: Level = new Level('TRACE', 6);
  /**
   * Level indicating that ALL messages will be output.
   * @readonly
   */
  public static readonly ALL: Level = new Level('ALL', 7);

  /**
   * An array containing all [[Level]]s.
   * @readonly
   */
  public static readonly LEVELS: Level[] = [
    Level.FATAL,
    Level.ERROR,
    Level.WARN,
    Level.INFO,
    Level.DEBUG,
    Level.TRACE
  ];

  private static readonly ALL_LEVELS: Level[] = [
    Level.OFF,
    ...Level.LEVELS,
    Level.ALL
  ];

  private levelName: string;
  private levelPriority: number;

  /**
   * Returns a [[Level]] object representing the `string` or `number` speicified.
   *
   * @param level - a value corresponding to a Level
   * @returns the represented Level, or the defaul if it does not exist
   */
  public static toLevel(
    level: string | number,
    defaultLevel: Level = Level.ERROR
  ): Level {
    let rval: Level = defaultLevel;
    if (
      typeof level === 'number' &&
      level >= this.OFF.priority &&
      level <= this.ALL.priority
    ) {
      rval = this.ALL_LEVELS[level];
    } else if (typeof level === 'string') {
      rval =
        this.ALL_LEVELS.find(lvl => lvl.name === level.toUpperCase()) ||
        defaultLevel;
    }
    return rval;
  }

  /**
   * Returns `true` if this [[Level]] is greater or equal to the priority of the supplied level.
   *
   * @param level - the level to be compared
   * @returns true if this level is greater than the one supplied
   */
  public isGreaterOrEqual(level: Level): boolean {
    return this.priority >= level.priority;
  }

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
}
