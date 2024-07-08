import {describe, it, expect} from 'vitest';
import ByteStream from '../src/utils/ByteStream.js';
import {Struct} from '../src/utils/Struct.js';
import {StructDef} from '../src/utils/types.js';

describe('Struct class', () => {
    it('should correctly parse a simple structure with numeric fields', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            field2: [Number, 4]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010010]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 2, field2: 1 });
    });
    it('should correctly parse a structure with boolean fields', () => {
        const structDef: StructDef = {
            flag1: [Boolean, 1],
            flag2: [Boolean, 1],
            flag3: [Boolean, 1]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00000101]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({ flag1: true, flag2: false, flag3: true });
    });
    it('should correctly parse nested structures', () => {
        const structDef: StructDef = {
            header: {
                type: [Number, 4],
                precision: [Number, 4]
            },
            metadata: {
                hasBoundingBox: [Boolean, 1],
                hasSize: [Boolean, 1],
                hasIdList: [Boolean, 1]
            }
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010010, 0b00000101]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({
            header: { type: 2, precision: 1 },
            metadata: { hasBoundingBox: true, hasSize: false, hasIdList: true }
        });
    });
    it('should correctly calculate total byte length for a simple structure', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            field2: [Number, 4]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010010]);
        struct.parse(byteStream);
        expect(byteStream.read(0).length).toBe(0);
    });
    it('should handle a byte stream shorter than required by the structure', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            field2: [Number, 6]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b0001]);
        expect(() => struct.parse(byteStream)).toThrow();
    });
    it('should handle a byte stream longer than required by the structure', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            field2: [Number, 4]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010010, 0b11111111]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 2, field2: 1 });
    });
    it('should handle a structure with zero-length fields', () => {
        const structDef: StructDef = {
            field1: [Number, 0],
            field2: [Number, 4]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010010]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 0, field2: 2 });
    });
    it('should handle a structure with only nested fields and no direct fields', () => {
        const structDef: StructDef = {
            nested1: {
                field1: [Number, 4]
            },
            nested2: {
                field2: [Boolean, 1]
            }
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteStream([0b00010001]);
        const result = struct.parse(byteStream);
        expect(result).toEqual({
            nested1: { field1: 1 },
            nested2: { field2: true }
        });
    });
});
