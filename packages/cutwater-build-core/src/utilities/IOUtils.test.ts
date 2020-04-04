import * as fs from 'fs';
import { IOUtils } from '..';

beforeAll(() => {
  IOUtils.mkdirs('temp/test');
});

afterAll(() => {
  IOUtils.rmdirs('temp/test');
});

describe('IOUtils', () => {
  it('can read a yaml file', () => {
    const result: any = IOUtils.readYamlSyncSafe('src/utilities/test.yaml');
    expect(result.Resource).toBeDefined();
  });

  it('can read a json file', () => {
    const result: any = IOUtils.readJSONSyncSafe('src/utilities/test.json');
    expect(result.Resource).toBeDefined();
  });

  it('can properly detect file format and read an object from JSON or Yaml', () => {
    expect(IOUtils.readObjectFromFileSyncSafe<any>('src/utilities/test.json').Resource).toBeDefined();
    expect(IOUtils.readObjectFromFileSyncSafe<any>('src/utilities/test.yaml').Resource).toBeDefined();
  });

  it('can properly write an object to a file', () => {
    const obj = IOUtils.readObjectFromFileSyncSafe<any>('src/utilities/test.json');
    IOUtils.writeObjectToFileSync(obj, 'temp/test/test.yaml');
    expect(fs.existsSync('temp/test/test.yaml'));
    expect(IOUtils.readObjectFromFileSyncSafe<any>('temp/test/test.yaml').Resource).toBeDefined();
  });
});
