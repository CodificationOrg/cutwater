import { existsSync } from 'fs';

import { IOUtils } from '..';

beforeAll(() => {
  IOUtils.mkdirs('temp/test');
});

afterAll(() => {
  IOUtils.rmdirs('temp/test');
});

describe('IOUtils', () => {
  it('can read a yaml file', () => {
    const result: Record<string, unknown> = IOUtils.readYamlSyncSafe('src/utilities/test.yaml');
    expect(result.Resource).toBeDefined();
  });

  it('can read a json file', () => {
    const result: Record<string, unknown> = IOUtils.readJSONSyncSafe('src/utilities/test.json');
    expect(result.Resource).toBeDefined();
  });

  it('can properly detect file format and read an object from JSON or Yaml', () => {
    expect(
      IOUtils.readObjectFromFileSyncSafe<Record<string, unknown>>('src/utilities/test.json').Resource,
    ).toBeDefined();
    expect(
      IOUtils.readObjectFromFileSyncSafe<Record<string, unknown>>('src/utilities/test.yaml').Resource,
    ).toBeDefined();
  });

  it('can properly write an object to a file', () => {
    const obj = IOUtils.readObjectFromFileSyncSafe<Record<string, unknown>>('src/utilities/test.json');
    IOUtils.writeObjectToFileSync(obj, 'temp/test/test.yaml');
    expect(existsSync('temp/test/test.yaml'));
    expect(IOUtils.readObjectFromFileSyncSafe<Record<string, unknown>>('temp/test/test.yaml').Resource).toBeDefined();
  });
});
