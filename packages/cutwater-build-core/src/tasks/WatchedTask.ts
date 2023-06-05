import { BuildContext, ExecutableTask } from '../types';

export class WatchedTask implements ExecutableTask<unknown> {
  private isWatchRunning = false;
  private shouldRerunWatch = false;
  private lastError: Error | undefined;

  private static readonly SUCCESS_MSG = 'Build succeeded';
  private static readonly FAILURE_MSG = 'Build failed';

  public execute(context: BuildContext): Promise<void> {
    return new Promise<void>(() => {
      const { logger } = context;
      const runWatch = async (): Promise<void> => {
        if (this.isWatchRunning) {
          this.shouldRerunWatch = true;
        } else {
          this.isWatchRunning = true;
          return executeTask(taskExecutable, context)
            .then(() => {
              if (this.lastError) {
                this.lastError = undefined;
                logger.log(WatchedTask.SUCCESS_MSG);
              }
              return finalizeWatch();
            })
            .catch((error: Error) => {
              if (!this.lastError || this.lastError !== error) {
                this.lastError = error;
                logger.log(WatchedTask.FAILURE_MSG);
              }
              return finalizeWatch();
            });
        }
      };

      const finalizeWatch = async (): Promise<void> => {
        this.isWatchRunning = false;
        if (this.shouldRerunWatch) {
          this.shouldRerunWatch = false;
          return runWatch();
        }
      };

      context.state.watchMode = true;
      context.gulp.watch(watchMatch, runWatch);
      runWatch().catch(console.error);
    });
  }
}
