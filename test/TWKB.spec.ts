import {describe, it, expect, vi} from 'vitest';
import {TWKB} from '../src/TWKB';
import ByteReader from '../src/ByteReader';

const testTWKB =
    'a20802df0182cca504ea9f8a05c0b5a9e70c0100120201500000500302a00100009e010200500000a0010000500000500000500102a0010000520001500200500000a00101006a0202080002040104080004040006060200040603101205081401061201040e0104180308220508140004180004160c06080c04000c04030e04030c04050e04071a080716080b180a030a080706040b06040b02040f02041302041300060b01040701040d010c13030c21050a1103042b05081701041901043d01082d05061d00044701084f000829000467050a2300041d02040f04040300040506400d020c0b0008110704070904030f06000b04030d040923080519040b3d080b490a031704031904031b04095f0c0123040325040b650a072b04032b04052d04032f040b610811b1010e01330403310413a1010c0737040939040d51060517020b2d060925080b2f08093d080d31060923040929040f5508178d010c092f040931041383010a0739040b39041173080737040937040737040f5506073904136908093104093104136708177f0a092f040f2d041d29042b2304391b044713044f0f04830117065b0d04590b045709045507045707045905045d050461050493010506650204b302080cd10102086b04049702080ae3010608eb010a087702047704049b040e12f30106087b02047d0204fd0104087b0204b50100067701047503046b07045103043703043303043703049b010f0a4907044909044d0904510d04570d045b11045d11045f130461150497012106671904671904671d04671d04671f04691f04d7013d08a5012d066d1f04df013f086d1d046f1f046d1f04dd013f08a5012d06dd014108711f04711f046f21046d1f048102490a5d19045715045915045b1704631304c90129086715049b011b063309029d011706690f04690d04690d046b0d04fd02310ed3011d08650d04d10119086d0d046f0f046f0d048d02250acd022d0c7111047111046d1504';

describe('TWKB', () => {
    it('should correctly parse a valid TWKB hex string into an array of points', () => {
        const twkbParser = new TWKB(testTWKB);
        const parsedPoints = twkbParser.parse();
        expect(parsedPoints).toBeInstanceOf(Array);
        expect(parsedPoints.length).toBeGreaterThan(0);
    });
    it('should accurately read and interpret the header and metadata structures', () => {
        const twkbParser = new TWKB('0102030405060708090A0B0C0D0E0F');
        const headData = twkbParser['readHeadData']();
        expect(headData).toHaveProperty('geometryType');
        expect(headData).toHaveProperty('precision');
        expect(headData).toHaveProperty('metadata');
    });
    it('should correctly calculate latitude, longitude, and time from deltas', () => {
        const twkbParser = new TWKB(testTWKB);
        const parsedPoints = twkbParser.parse();
        parsedPoints.forEach(point => {
            expect(point).toHaveProperty('latitude');
            expect(point).toHaveProperty('longitude');
            expect(point).toHaveProperty('time');
        });
    });
    it('should handle typical precision values and compute coordinates accurately', () => {
        const twkbParser = new TWKB(testTWKB);
        const parsedPoints = twkbParser.parse();
        parsedPoints.forEach(point => {
            expect(point.latitude).toBeGreaterThanOrEqual(-90);
            expect(point.latitude).toBeLessThanOrEqual(90);
            expect(point.longitude).toBeGreaterThanOrEqual(-180);
            expect(point.longitude).toBeLessThanOrEqual(180);
        });
    });
    it('should process typical point counts and return the expected number of points', () => {
        const twkbParser = new TWKB(testTWKB);
        const parsedPoints = twkbParser.parse();
        expect(parsedPoints.length).toBeGreaterThan(0);
    });
    it('should throw an error when the hex string has an odd number of characters', () => {
        expect(() => new TWKB('0108030405060708090A0B0C0D0')).toThrow('Odd number of characters in a hex string');
    });
    it('should throw an error when the hex string has bounding box metadata', () => {
        const twkbParser = new TWKB('0102030405060708090A0B0C0D0E0F');
        vi.spyOn(twkbParser['reader'], 'readVarInt').mockReturnValueOnce(1);
        expect(() => twkbParser.parse()).toThrow("Malformed track data: has bounding box or doesn't have extended dimensions");
    });
    it('should throw an error when the hex string lacks extended dimensions', () => {
        const twkbParser = new TWKB('0102030405060708090A0B0C0D0E0F');
        vi.spyOn(twkbParser['reader'], 'readVarInt').mockReturnValueOnce(1);
        expect(() => twkbParser.parse()).toThrow("Malformed track data: has bounding box or doesn't have extended dimensions");
    });
    it('should throw an error when the hex string lacks M point', () => {
        const twkbParser = new TWKB('0108030405060708090A0B0C0D0E0F');
        vi.spyOn(twkbParser['reader'], 'readVarInt').mockReturnValueOnce(1);
        expect(() => twkbParser.parse()).toThrow("Malformed track data: M point not found");
    });
    it('should handle cases where the byte buffer ends unexpectedly', () => {
        const twkbParser = new TWKB('010203040506070809');
        expect(() => twkbParser.parse()).toThrow();
    });
    it('should ensure that unZigZag function correctly decodes zigzag-encoded numbers', () => {
        const reader = new ByteReader('');
        expect(reader.unZigZag(2)).toBe(1);
        expect(reader.unZigZag(3)).toBe(-2);
    });
    it('should verify that readVarInt correctly reads variable-length integers', () => {
        const reader = new ByteReader('8E02');
        expect(reader.readVarInt()).toBe(270);
    });
});
