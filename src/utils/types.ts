/** Some type alias for more code reading comfort */
export type Byte = number;

/** Struct definition for Struct class constructor */
export type StructDef = {
    [field: string]: [
        NumberConstructor | BooleanConstructor,
        number
    ] | StructDef
};
