import { EventEmitter } from 'node:events';
import { OutputTracker } from './OutputTracker';

let emitter: EventEmitter;
let tracker: OutputTracker;

type MockEvent = {
  method: string;
  args: string[];
};

beforeEach(() => {
  emitter = new EventEmitter();
  tracker = OutputTracker.create(emitter);
});

const emit = (value: string): void => {
  emitter.emit(OutputTracker.DEFAULT_EVENT, value);
};

describe('OutputTracker', () => {
  describe('data', () => {
    it('collects output into the data property', () => {
      emit('output');
      expect(tracker.data).toHaveLength(1);
      expect(tracker.data[0]).toBe('output');
    });
    it('collects typed output into the data property', () => {
      const typedTracker = OutputTracker.create<MockEvent>(emitter);
      emit(JSON.stringify({ method: 'get', args: ['yes', 'no'] }));
      expect(typedTracker.data).toHaveLength(1);
      expect(typedTracker.data[0].method).toBe('get');
      expect(typedTracker.data[0].args).toHaveLength(2);
    });
    it('collects primitive typed output into the data property', () => {
      const typedTracker = OutputTracker.create<number>(emitter);
      emit('5');
      expect(typedTracker.data).toHaveLength(1);
      expect(typedTracker.data[0]).toBe(5);
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
