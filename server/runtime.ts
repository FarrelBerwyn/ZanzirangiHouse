// Process-wide runtime state shared by the HTTP entry point and the health endpoint.

export const runtimeState = {
  startedAt: new Date().toISOString(),
  pid: process.pid,
  /** True once the database adapter connected and verified its schema. */
  databaseReady: false,
  /** Last database startup error (message only, never credentials). */
  databaseError: null as string | null,
  shuttingDown: false,
};

export const uptimeSeconds = () => Math.round(process.uptime());
