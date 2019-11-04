import { WebpackTask } from './tasks/WebpackTask';

export { WebpackTaskConfig, WebpackResources, WebpackTask } from './tasks/WebpackTask';

export const webpack: WebpackTask = new WebpackTask();
export default webpack;
