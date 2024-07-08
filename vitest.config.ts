import {defineConfig} from 'vitest/config';
import {resolve} from 'node:path';

export default defineConfig({
    test: {
        dir: 'test',
        watch: false,
        alias: {
            '$src': resolve(__dirname, './src')
        }
    }
});
