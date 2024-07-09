/**
 * Byte reader class
 */
export default class ByteReader {
    private readonly buffer: ArrayBuffer;
    private readonly view: DataView;
    private cursor: number;

    constructor(hex: string) {
        this.buffer = ByteReader.HexToBuffer(hex);
        this.view = new DataView(this.buffer);
        this.cursor = 0;
    }

    /**
     * Unzigsags a zigzag-encoded byte.
     * @param value - the zigzag-encoded number to unzigzag.
     * @returns The unzigzagged number.
     */
    public unZigZag(value: number): number {
        return !(value & 0x01)
            ? (value >> 1)
            : (-1 * ((value + 1) >> 1));
    }

    /**
     * Read single byte from byte buffer
     * @returns byte data
     */
    public readByte(): number {
        return this.view.getUint8(this.cursor++);
    }

    /**
     * Read varint from byte buffer
     * @returns varint data
     */
    public readVarInt(): number {
        let result = 0;
        let shift = 0;
        let byte: number;

        do {
            byte = this.view.getUint8(this.cursor++);
            result |= (byte & 0x7F) << shift;
            shift += 7;
        } while (byte >= 0x80);

        return result;
    }

    /**
     * Convert hex string to array buffer
     * @param hex - hex string to convert
     * @private
     */
    private static HexToBuffer(hex: string): ArrayBuffer {
        if (hex.length % 2 !== 0)
            throw 'Odd number of characters in a hex string';

        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++)
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);

        return bytes.buffer;
    }
}
