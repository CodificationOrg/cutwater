import { Level } from './Level';

describe('Level Unit Tests', () => {
  describe('toLevel', () => {
    it('properly returns the correct level for a valid number', () => {
      expect(Level.toLevel(2)).toBe(Level.ERROR);
    });
    it('properly returns the correct level for a valid name', () => {
      expect(Level.toLevel('FaTAl')).toBe(Level.FATAL);
    });
    it('properly returns the built-in default level for an invalid number', () => {
      expect(Level.toLevel(20)).toBe(Level.ERROR);
    });
    it('properly returns the supplied default level for an invalid number', () => {
      expect(Level.toLevel(20, Level.DEBUG)).toBe(Level.DEBUG);
    });
  });
});
