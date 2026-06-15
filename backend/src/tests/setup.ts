// Jest setupFiles bootstrap — runs before any module is imported, so env
// defaults are in place when config/logger initialize. Keep this to env
// bootstrapping only (no fixtures, no mocks).

// logger.ts resolves `join(__dirname, LOG_DIR)`; give it a default so the real
// logger can initialize when a test imports a module that pulls in the logger.
process.env.LOG_DIR = process.env.LOG_DIR ?? 'logs';
