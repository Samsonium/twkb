import {describe, it, expect} from 'vitest';
import ByteStream from '$src/utils/ByteStream.js';

describe('ByteStream class', () => {
    it('should correctly decode a valid hex string into a byte array', () => {
        const hexString = '48656c6c6f';
        const byteStream = new ByteStream(hexString);
        expect(byteStream['bytes']).toEqual([72, 101, 108, 108, 111]);
    });
    it('should handle invalid hex string input gracefully', () => {
        const invalidHexString = 'GHIJKL';
        expect(() => new ByteStream(invalidHexString)).toThrow();
    });
    it('should handle non-hex characters in hex string input', () => {
        const nonHexString = '48656c6c6fZZ';
        expect(() => new ByteStream(nonHexString)).toThrow();
    });
    it('should initialize correctly with a byte array', () => {
        const byteArray = [72, 101, 108, 108, 111];
        const byteStream = new ByteStream(byteArray);
        expect(byteStream['bytes']).toEqual(byteArray);
    });
    it('should return the correct byte in sequence', () => {
        const byteStream = new ByteStream([0x01, 0x02, 0x03]);
        expect(byteStream.read()[0]).toBe(0x01);
        expect(byteStream.read()[0]).toBe(0x02);
        expect(byteStream.read()[0]).toBe(0x03);
    });
    it('should increment the index correctly after each call', () => {
        const byteStream = new ByteStream([0x01, 0x02, 0x03]);
        byteStream.read();
        expect(byteStream['index']).toBe(1);
        byteStream.read();
        expect(byteStream['index']).toBe(2);
        byteStream.read();
        expect(byteStream['index']).toBe(3);
    });
    it('should handle gracefully when reading past the end of the stream', () => {
        const byteStream = new ByteStream([0x01, 0x02]);
        byteStream.read();
        byteStream.read();
        expect(() => byteStream.read()).toThrow();
    });
    it('should handle correctly with an empty byte array', () => {
        const byteStream = new ByteStream([]);
        expect(() => byteStream.read()).toThrow();
    });
    it('should correctly read multiple bytes from the stream', () => {
        const byteStream = new ByteStream([0x01, 0x02, 0x03, 0x04]);
        const result = byteStream.read(3);
        expect(result).toEqual([0x01, 0x02, 0x03]);
    });
    it('should throw an error when reading past the end of the stream', () => {
        const byteStream = new ByteStream([0x01, 0x02]);
        byteStream.read(2);
        expect(() => byteStream.read(1)).toThrow();
    });
    it('should throw an error when reading from an empty byte array', () => {
        const byteStream = new ByteStream([]);
        expect(() => byteStream.read()).toThrow();
    });
});
