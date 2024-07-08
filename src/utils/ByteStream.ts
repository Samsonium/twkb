import type {Byte} from './types.js';

/**
 * ByteStream class provides streaming over
 * byte array.
 */
export default class ByteStream {
    private readonly bytes: Byte[];
    private index: number;

    /**
     * Create ByteStream from hex string
     * @param hex - hexadecimal string
     */
    public constructor(hex: string);

    /**
     * Create ByteStream from bytes array
     * @param bytes - bytes array
     */
    public constructor(bytes: Byte[]);

    public constructor(hexOrBuffer: string | Byte[]) {
        if (typeof hexOrBuffer === 'string')
            hexOrBuffer = ByteStream.decodeHex(hexOrBuffer);

        this.bytes = hexOrBuffer;
        this.index = 0;
    }

    /**
     * Read the next byte from the byte stream.
     * @returns The next byte from the stream.
     */
    public read(size: number = 1): number[] {
        if (this.index + size - 1 >= this.bytes.length)
            throw `End of bytearray reached (length: ${this.bytes.length}, index: ${this.index})`;

        const bytes = this.bytes.slice(this.index, this.index + size);
        this.index += size;
        return bytes;
    }

    /**
     * Decode hex string into byte array
     * @param hex
     * @private
     */
    private static decodeHex(hex: string): Byte[] {
        const result: Byte[] = [];
        for (let i = 0; i < hex.length; i += 2) {
            const char = parseInt(hex.substring(i, i + 2), 16);
            if (Number.isNaN(char))
                throw 'Failed to parse hex string';

            result.push(char);
        }

        return result;
    }
}
