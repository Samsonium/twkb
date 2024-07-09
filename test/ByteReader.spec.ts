import {describe, it, expect} from 'vitest';
import ByteReader from '../src/ByteReader.js';

describe('ByteReader', () => {
    it('should convert a valid hex string to an ArrayBuffer correctly', () => {
        const hex = 'deadbeef';
        const byteReader = new ByteReader(hex);
        const expectedBuffer = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
        expect(byteReader['buffer']).toEqual(expectedBuffer);
    });
    it('should read a single byte correctly from the buffer', () => {
        const hex = 'deadbeef';
        const byteReader = new ByteReader(hex);
        expect(byteReader.readByte()).toBe(0xde);
    });
    it('should read a varint correctly from the buffer', () => {
        const hex = '8e02';
        const byteReader = new ByteReader(hex);
        expect(byteReader.readVarInt()).toBe(270);
    });
    it('should unzigzag a positive zigzag-encoded number correctly', () => {
        const byteReader = new ByteReader('');
        expect(byteReader.unZigZag(4)).toBe(2);
    });
    it('should handle an empty hex string gracefully', () => {
        const byteReader = new ByteReader('');
        expect(byteReader['buffer'].byteLength).toBe(0);
    });
    it('should handle a hex string with an odd number of characters gracefully', () => {
        expect(() => new ByteReader('abc')).toThrow();
    });
    it('should read a varint that spans multiple bytes correctly', () => {
        const hex = 'e58e26';
        const byteReader = new ByteReader(hex);
        expect(byteReader.readVarInt()).toBe(624485);
    });
    it('should handle reading beyond the buffer length gracefully', () => {
        const hex = 'deadbeef';
        const byteReader = new ByteReader(hex);
        for (let i = 0; i < 4; i++) {
            byteReader.readByte();
        }
        expect(() => byteReader.readByte()).toThrow();
    });
});
