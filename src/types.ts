/** Point delta */
export type DeltaPoint = {
    /** Longitude delta */
    dx: number;

    /** Latitude delta */
    dy: number;

    /** Unix timestamp delta */
    dt: number;
};

/** Result point structure */
export type Point = {
    latitude: number;
    longitude: number;
    time: number;
};

/** Head content data */
export type HeadData = {
    geometryType: number;
    precision: number,
    metadata: {
        hasBoundingBox: boolean;
        hasSize: boolean;
        hasExtendedDimensions: boolean;
    };
};

/** Struct definition for Struct class constructor */
export type StructDef = {
    [field: string]: [NumberConstructor | BooleanConstructor, number]
        | [NumberConstructor | BooleanConstructor, number, (value: any) => unknown]
        | StructDef
};
