import { DynamoItem } from './DynamoItem';

describe('DynamoItem', () => {
  describe('prune', () => {
    it('can properly prune empty optional properties', () => {
      const item = new DynamoItem();
      item.setString('email', 'foo@test.com');
      item.setString('domainId', 'CONG.345');
      item.setNumber('lastAccess', Date.now());
      item.toStringSet('roles', []);

      const result = item.prune();
      expect(result.pic).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.roles).toBeUndefined();
      expect(result.email).toBeDefined();
    });
  });
});
