// Vitest setupFiles bootstrap — runs before any module is imported, so env
// defaults are in place when config/logger initialize. Keep this to env
// bootstrapping only (no fixtures, no mocks).

// routing-controllers / class-validator decorators read metadata via reflect-metadata.
// Import it once for the whole test run so decorated classes can be imported in tests.
import 'reflect-metadata';

// logger.ts resolves `join(__dirname, LOG_DIR)`; give it a default so the real
// logger can initialize when a test imports a module that pulls in the logger.
process.env.LOG_DIR = process.env.LOG_DIR ?? 'logs';
