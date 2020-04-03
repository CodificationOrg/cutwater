import * as fs from 'fs';
import { IOUtils } from '..';

beforeAll(() => {
  if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
  }
});

afterAll(() => {
  fs.readdirSync('./temp').forEach(file => fs.unlinkSync(`./temp/${file}`));
  fs.rmdirSync('./temp');
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
    IOUtils.writeObjectToFileSync(obj, './temp/test.yaml');
    expect(fs.existsSync('./temp/test.yaml'));
    expect(IOUtils.readObjectFromFileSyncSafe<any>('./temp/test.yaml').Resource).toBeDefined();
  });
});
