import { BuildState } from './BuildState';

describe('BuildState', () => {
  const state = BuildState.createNull();

  describe('toolVersion', () => {
    it('should return the build tools version', () => {
      expect(state.toolVersion).toBe('nullable');
    });
  });
});
