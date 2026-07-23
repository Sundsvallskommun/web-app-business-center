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
    // Vite 8 enables native tsconfig path resolution by default, but it mis-resolves
    // this tsconfig's baseUrl-relative mappings (`baseUrl: "src"` + `"@/*": ["*"]`,
    // required on TS < 5.0) into a broken relative specifier. Disable it and let the
    // vite-tsconfig-paths plugin below own alias resolution instead.
    tsconfigPaths: false,
  },
  plugins: [
    // Resolves the `@/*` path aliases (reads `baseUrl` correctly).
    tsconfigPaths(),
    // routing-controllers / class-validator depend on `emitDecoratorMetadata`, which esbuild
    // (Vitest's default transform) does not emit. SWC does, so we transform with it instead.
    swc.vite({
      // Ignore the project's `.swcrc` (it targets the `build:swc` production build). It sets
      // `module: commonjs` and `baseUrl`/`paths`, which would make SWC emit CJS `require()`
      // and rewrite `@/*` aliases into broken relative specifiers before Vite can resolve them.
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
      exclude: ['src/data-contracts/**', 'src/**/*.{test,spec}.ts', 'src/tests/**', 'src/types/**', 'src/swagger-typescript-api.ts'],
    },
  },
});
