export class Level {
  public static readonly OFF = new Level('OFF', 0);
  public static readonly FATAL = new Level('FATAL', 1);
  public static readonly ERROR = new Level('ERROR', 2);
  public static readonly WARN = new Level('WARN', 3);
  public static readonly INFO = new Level('INFO', 4);
  public static readonly DEBUG = new Level('DEBUG', 5);
  public static readonly TRACE = new Level('TRACE', 6);
  public static readonly ALL = new Level('ALL', 7);

  public static readonly LEVELS = [Level.FATAL, Level.ERROR, Level.WARN, Level.INFO, Level.DEBUG, Level.TRACE];

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

  get name(): string {
    return this.levelName;
  }

  get priority(): number {
    return this.levelPriority;
  }

  public isGreaterOrEqual(level: Level): boolean {
    return this.priority >= level.priority;
  }
}
