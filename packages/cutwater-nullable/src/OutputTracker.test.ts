import EventEmitter from 'events';
import { OutputTracker } from './OutputTracker';

let emitter: EventEmitter;
let tracker: OutputTracker;
const EVENT_NAME = 'outputEvent';

beforeEach(() => {
  emitter = new EventEmitter();
  tracker = OutputTracker.create(emitter, EVENT_NAME);
});

const emit = (value: string): void => {
  emitter.emit(EVENT_NAME, value);
};

describe('OutputTracker', () => {
  describe('data', () => {
    it('collects output into the data property', () => {
      emit('output');
      expect(tracker.data).toHaveLength(1);
      expect(tracker.data[0]).toBe('output');
    });
  });
  describe('clear', () => {
    it('clears and returns collected data', () => {
      emit('output');
      const result = tracker.clear();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('output');
    });
  });
  describe('stop', () => {
    it('stop tracking output for the emitter', () => {
      tracker.stop();
      emit('output');
      expect(tracker.data).toHaveLength(0);
    });
  });
});
