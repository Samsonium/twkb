import type {Byte, StructDef} from '$src/utils/types.js';
import ByteStream from '$src/utils/ByteStream.js';

/**
 * `struct` implementation for parsing
 * byte sequences.
 *
 * @example Usage
 *  const struct = new Struct({
 *      header: {
 *          type: [Number, 4], // 4-bit numeric value
 *          precision: [Number, 4]
 *      },
 *      metadata: {
 *          hasBoundingBox: [Boolean, 1], // 1-bit boolean value
 *          hasSize: [Boolean, 1],
 *          hasIdList: [Boolean, 1]
 *      }
 *  });
 *
 *  const info = struct.parse(someByteArray);
 *  // {
 *  //     header: {
 *  //         type: 1,
 *  //         precision: 0
 *  //     },
 *  //     metadata: {
 *  //         hasBoundingBox: false,
 *  //         hasSize: true,
 *  //         hasIdList: false
 *  //     }
 *  // }
 */
export class Struct {
    private readonly description: StructDef;
    private actualByte: [Byte, number]; // [byte, bit-n]

    /**
     * Create the struct
     * @param description - structure schema
     */
    constructor(description: StructDef) {
        this.description = description;
    }

    /**
     * Parse bytes and convert it to structure
     */
    public parse(stream: ByteStream, def: StructDef = this.description): Record<string, any> {
        const result: Record<string, any> = {};

        for (const key in def) {
            if (!Array.isArray(def[key]))
                result[key] = this.parse(stream, def[key]);
            else {
                if (def[key][1] < 1) {
                    result[key] = def[key][0](0);
                    continue;
                }

                let data: number = 0;
                const length = def[key][1];
                for (let i = 0; i < length; i++) {
                    if (!this.actualByte)
                        this.actualByte = [stream.read()[0], 0];

                    const bit = (this.actualByte[0] >> this.actualByte[1]) & 1;
                    data |= bit << i;
                    this.actualByte[1]++;

                    if (this.actualByte[1] === 8)
                        this.actualByte = null;
                }

                result[key] = def[key][0](data);
            }
        }

        return result;
    }
}
