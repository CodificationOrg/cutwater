import { WebpackTask } from './tasks/WebpackTask';

export { WebpackResources, WebpackTask, WebpackTaskConfig } from './tasks/WebpackTask';
export { WebpackUtils } from './utilities/WebpackUtils';

export const webpack: WebpackTask = new WebpackTask();
