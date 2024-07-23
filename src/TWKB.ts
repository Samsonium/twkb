import ByteReader from './ByteReader.ts';
import Struct from './Struct.ts';
import type {DeltaPoint, Point, HeadData} from './types.ts';

/**
 * TWKB track part parser
 */
export default class TWKB {
    private readonly reader: ByteReader;

    constructor(hex: string) {
        this.reader = new ByteReader(hex);
    }

    /**
     * Parse twkb hex string and convert it into array of points
     * @see {Point}
     */
    public parse(): Point[] {
        const {
            geometryType,
            precision,
            metadata
        } = this.readHeadData();

        const facXY = Math.pow(10, precision);
        if (metadata.hasBoundingBox || !metadata.hasExtendedDimensions)
            throw 'Malformed track data: has bounding box or doesn\'t have extended dimensions';

        const dims = this.reader.readVarInt();
        const hasM = (dims & 0x02) >> 1;
        if (!hasM)
            throw 'Malformed track data: M point not found';

        const preM = (dims & 0xE0) >> 5;
        const facM = Math.pow(10, preM);

        const pointsCount = this.reader.readVarInt();
        const result: Point[] = [];

        let lx = 0;
        let ly = 0;
        let lt = 0;

        for (let i = 0; i < pointsCount; i++) {
            const { dx, dy, dt } = this.readCoords();

            lx += dx;
            ly += dy;
            lt += Math.abs(dt);

            result.push({
                latitude: ly / facXY,
                longitude: lx / facXY,
                time: (-lt / facM) * 4000
            });
        }

        return result;
    }

    /**
     * Read header and metadata structures
     * @private
     */
    private readHeadData(): HeadData {
        const struct = new Struct({
            geometryType: [Number, 4],
            precision: [Number, 4, (v: number) => this.reader.unZigZag(v)],
            meta: {
                hasBoundingBox: [Boolean, 1],
                hasSize: [Boolean, 1],
                _: [Boolean, 1],
                hasExtendedDimensions: [Boolean, 1]
            }
        });

        const {
            geometryType,
            precision,
            meta: {
                hasBoundingBox,
                hasSize,
                hasExtendedDimensions
            }
        } = struct.parse(this.reader);

        return {
            geometryType,
            precision,
            metadata: {
                hasBoundingBox,
                hasSize,
                hasExtendedDimensions
            }
        };
    }

    /**
     * Read 3 varints for deltas of x, y, z
     * @private
     */
    private readCoords(): DeltaPoint {
        return {
            dx: this.reader.zigZagDecode(this.reader.readVarInt()),
            dy: this.reader.zigZagDecode(this.reader.readVarInt()),
            dt: this.reader.zigZagDecode(this.reader.readVarInt())
        };
    }
}
