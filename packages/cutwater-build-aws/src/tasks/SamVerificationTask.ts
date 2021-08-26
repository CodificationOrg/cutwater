import { SamCliTask } from './SamCliTask';

export class SamVerificationTask extends SamCliTask<void> {
  public constructor() {
    super('sam-verification');
    this.setOptions({ help: true });
  }
}
