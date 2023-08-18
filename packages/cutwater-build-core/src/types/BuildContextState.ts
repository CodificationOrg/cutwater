export interface BuildContextState {
  wroteSummary: boolean;
  writingSummary: boolean;
  watchMode?: boolean;
  fromRunGulp?: boolean;
  wiredUpErrorHandling: boolean;
  duringFastExit: boolean;
}
