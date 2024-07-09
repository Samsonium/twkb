import {describe, it, expect} from 'vitest';
import ByteReader from '../src/ByteReader';
import Struct from '../src/Struct';
import {StructDef} from '../src';

describe('Struct class', () => {
    it('should correctly parse a simple structure with numeric fields', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            field2: [Number, 4]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('0a');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 10, field2: 0 });
    });
    it('should correctly parse a structure with boolean fields', () => {
        const structDef: StructDef = {
            flag1: [Boolean, 1],
            flag2: [Boolean, 1]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('01');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ flag1: true, flag2: false });
    });
    it('should correctly parse nested structures', () => {
        const structDef: StructDef = {
            header: {
                type: [Number, 4],
                precision: [Number, 4]
            }
        } as const;
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('0a');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ header: { type: 10, precision: 0 } });
    });
    it('should handle mixed numeric and boolean fields in a structure', () => {
        const structDef: StructDef = {
            field1: [Number, 4],
            flag1: [Boolean, 1]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('11');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 1, flag1: true });
    });
    it('should handle empty structure definitions', () => {
        const structDef: StructDef = {};
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('');
        const result = struct.parse(byteStream);
        expect(result).toEqual({});
    });
    it('should handle structures with zero-length fields', () => {
        const structDef: StructDef = {
            field1: [Number, 0]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ field1: 0 });
    });
    it('should handle structures with fields exceeding byte boundaries', () => {
        const structDef: StructDef = {
            field1: [Number, 18]
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('0f01');
        expect(() => struct.parse(byteStream)).toThrow();
    });
    it('should handle structures with deeply nested definitions', () => {
        const structDef: StructDef = {
            level1: {
                level2: {
                    level3: {
                        field1: [Number, 4]
                    }
                }
            }
        };
        const struct = new Struct(structDef);
        const byteStream = new ByteReader('0a');
        const result = struct.parse(byteStream);
        expect(result).toEqual({ level1: { level2: { level3: { field1: 10 } } } });
    });
});
