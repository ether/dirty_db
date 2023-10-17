Bun.build(
    {
        entrypoints: ['./index.ts'],
        outdir: './dist',
        minify: false,
        splitting: true
    }
)