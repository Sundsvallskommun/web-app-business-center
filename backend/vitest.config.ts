import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite 8 transforms with Oxc by default, which (like esbuild) does not emit
  // `emitDecoratorMetadata`. unplugin-swc sets `esbuild: false`, but that no longer
  // disables the default transform, so disable Oxc explicitly and let SWC (below) own it.
  oxc: false,
  esbuild: false,
  resolve: {
    // Vite 8's native tsconfig paths mis-resolves this tsconfig's baseUrl-relative
    // mappings (`baseUrl: "src"` + `"@/*": ["*"]`), so disable it and resolve aliases
    // via the vite-tsconfig-paths plugin below instead.
    tsconfigPaths: false,
  },
  plugins: [
    tsconfigPaths(),
    // routing-controllers / class-validator depend on `emitDecoratorMetadata`, which esbuild
    // (Vitest's default transform) does not emit. SWC does, so we transform with it instead.
    swc.vite({
      // The project ships a root `.swcrc` for the `build:swc` production build; it forces
      // `module: commonjs` and its own baseUrl/paths, which during the Vitest transform would
      // emit CJS `require()` and rewrite `@/*` aliases into broken relative specifiers.
      // Ignore it here — this transform's config is self-contained.
      swcrc: false,
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2022',
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/data-contracts/**', 'src/**/*.{test,spec}.ts', 'src/tests/helpers/**', 'src/types/**', 'src/generate-data-contracts.ts'],
    },
  },
});
