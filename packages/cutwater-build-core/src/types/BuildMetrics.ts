export interface BuildMetrics {
  start?: [number, number];
  coverageResults: number;
  coveragePass: number;
  coverageTotal: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  testsFlakyFailed: number;
  testsSkipped: number;
  taskRun: number;
  subTasksRun: number;
  taskErrors: number;
  totalTaskSrc: number;
  totalTaskHrTime: [number, number] | undefined;
  taskCreationTime?: [number, number];
}
