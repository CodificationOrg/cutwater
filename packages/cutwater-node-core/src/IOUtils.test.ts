import { System } from '@codification/cutwater-nullable';
import { Readable } from 'stream';
import { IOUtils } from './IOUtils';

const system = System.createNull();

describe('IOUtils', () => {
  describe('bufferToReadable', () => {
    it('can convert a Buffer to a Readable', async () => {
      const buffer: Buffer = Buffer.from([0, 1, 2, 3, 4]);
      const result: Readable = IOUtils.bufferToReadable(buffer);
      expect(result).toBeTruthy();
    });
  });

  describe('readableToBuffer', () => {
    it('can convert a Readable to a Buffer', async () => {
      const data: Buffer = await IOUtils.readableToBuffer(
        IOUtils.bufferToReadable(Buffer.from([0, 1, 2, 3, 4]))
      );
      expect(data.length).toBe(5);
    });
  });

  describe('zip', () => {
    it('can zip a Buffer', () => {
      IOUtils.zip(
        'test.txt',
        'zip-test.zip',
        Buffer.from('Hello world!', 'utf-8'),
        system
      );
      const result = system.toFileReference('zip-test.zip');
      expect(result.exists()).toBeTruthy();
      expect(result.readToBuffer().length).toBeGreaterThan(0);
    });
  });

  describe('unzip', () => {
    IOUtils.zip(
      'test.txt',
      'unzip-test.zip',
      Buffer.from('Hello world!', 'utf-8'),
      system
    );
    IOUtils.unzip('unzip-test.zip', '/', system);
    const result = system.toFileReference('/test.txt');
    expect(result.exists()).toBeTruthy();
    expect(result.read()).toBe('Hello world!');
  });
});
