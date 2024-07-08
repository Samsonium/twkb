require('esbuild').build({
    format: 'esm',
    bundle: true,
    target: 'esnext',
    platform: 'node',
    outfile: 'lib/index.js',
    entryPoints: ['src/index.ts']
});
