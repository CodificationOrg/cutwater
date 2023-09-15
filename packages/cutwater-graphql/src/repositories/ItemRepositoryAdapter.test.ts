import {
  MemoryItemRepository,
  MethodCallData,
  MockItem,
  TrackedItemRepository,
} from '@codification/cutwater-repo';
import { OutputTracker } from '../../../cutwater-nullable/src';
import { NodeId } from '../core';
import { ItemRepositoryAdapter } from './ItemRepositoryAdapter';
import { PropertyDescriptor } from './PropertyDescriptor';

let count: number;
let items: MockItem[];
let adapter: ItemRepositoryAdapter<MockItem>;
let repo: TrackedItemRepository<MockItem>;
let randomId: string;
let randomIndex: number;
let randomItem: MockItem;
let methodCallTracker: OutputTracker<MethodCallData>;

beforeEach(() => {
  items = MockItem.createNullables(25);
  count = items.length;
  repo = TrackedItemRepository.create(
    MemoryItemRepository.createNullable(items)
  );
  methodCallTracker = repo.trackMethodCalls();
  adapter = new ItemRepositoryAdapter<MockItem>(
    repo,
    new PropertyDescriptor('MockItem', 'userId', 'groupId')
  );
  randomIndex = Math.floor(Math.random() * items.length);
  randomItem = items[randomIndex];
  randomId = `${randomIndex}`;
});

describe('ItemRepositoryAdapter', () => {
  describe('constructor', () => {
    it('can create a new instance', async () => {
      expect(adapter).toBeTruthy();
    });
  });

  describe('getNodeId', () => {
    it('can generate a node id', async () => {
      const result = await adapter.getNodeId(randomItem);
      expect(result.nodeType).toBe(repo.itemType);
      expect(result.objectId).toBe(randomId);
      expect(result.id.indexOf(repo.itemType)).toBe(-1);
    });
  });

  describe('isSource', () => {
    it('can verify if it is a node source by NodeId', async () => {
      const id = NodeId.create('MockItem', '0');
      expect(adapter.isSource(id)).toBeTruthy();
    });

    it('can verify if it is a node source by nodeType string', async () => {
      const id = NodeId.create('MockItem', '0');
      expect(adapter.isSource(id.nodeType)).toBeTruthy();
    });

    it('can verify if it is not a node source', async () => {
      const id = NodeId.create('RealItem', '0');
      expect(adapter.isSource(id)).toBeFalsy();
    });
  });

  describe('dataLoader', () => {
    it('can create a functional DataLoader', async () => {
      const loader = adapter.dataLoader;
      const items = [
        ...(await adapter.getAll('a')),
        ...(await adapter.getAll('b')),
      ];
      const keys: string[] = [];
      while (keys.length < randomIndex + 1) {
        const item = items[0 + keys.length];
        if (!keys.includes(item.userId)) {
          keys.push(item.userId);
        }
      }
      expect(keys.length).toBeGreaterThan(0);

      loader.loadMany(keys);
      const key = keys[Math.min(randomIndex - 5, 0)];
      const result = await loader.load(key);
      expect(result).toBeTruthy();
      expect(result?.userId).toBe(key);
    });
  });

  describe('resolve', () => {
    it('can resolve a valid node id', async () => {
      const id = NodeId.create('MockItem', randomId);
      const result = await adapter.resolve(id);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(id.id);
    });

    it('returns undefined for an missing id', async () => {
      const id = NodeId.create('MockItem', `${randomIndex}abc`);
      const result = await adapter.resolve(id);
      expect(result).toBeUndefined();
    });
  });

  describe('resolveConnections', () => {
    it('can resolve connections based on parent id', async () => {
      const result = await adapter.resolveConnections(
        NodeId.create('MockParent', 'a')
      );
      expect(result).toBeTruthy();
      expect(result.length).toBe(12);
      expect(result[0].groupId).toBe('a');
    });
  });
});
