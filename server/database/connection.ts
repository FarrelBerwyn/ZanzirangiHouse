import mysql from 'mysql2/promise';
import dns from 'dns';
import net from 'net';
import { env } from '../config/env.ts';

let connectionPool: mysql.Pool | null = null;

export interface DiagnosticStep {
  step: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  details?: string;
  error?: string;
}

export interface ConnectionDiagnosticResult {
  success: boolean;
  timestamp: string;
  target: {
    host: string;
    port: number;
    database: string;
    user: string;
  };
  steps: DiagnosticStep[];
  error?: string;
}

/**
 * Returns or creates the singleton MySQL connection pool using environment variables.
 * Defaults adhere strictly to Hostinger internal production settings.
 */
export function getMysqlPool(): mysql.Pool {
  if (!connectionPool) {
    const host = process.env.DB_HOST || env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.DB_PORT || env.MYSQL_PORT || 3306);
    const user = process.env.DB_USER || env.MYSQL_USER || '';
    const password = process.env.DB_PASSWORD || env.MYSQL_PASSWORD || '';
    const database = process.env.DB_NAME || env.MYSQL_DATABASE || '';
    const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT || env.MYSQL_CONNECTION_LIMIT || 10);

    connectionPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 15000,
    });
  }
  return connectionPool;
}

/**
 * Gracefully shuts down the MySQL connection pool.
 */
export async function closeMysqlPool(): Promise<void> {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}

/**
 * Internal Diagnostic Function: testDatabaseConnection()
 * Rigorously validates:
 * 1. DNS / Hostname resolution
 * 2. TCP socket connectivity to the target port
 * 3. MySQL authentication
 * 4. Database schema selection
 * 5. Simple query execution (SELECT 1 as ping)
 *
 * NOTE: Never logs or exposes password, tokens, or raw connection strings.
 */
export async function testDatabaseConnection(): Promise<ConnectionDiagnosticResult> {
  const host = process.env.DB_HOST || env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || env.MYSQL_USER || '';
  const database = process.env.DB_NAME || env.MYSQL_DATABASE || '';

  const steps: DiagnosticStep[] = [];
  let overallSuccess = true;
  let finalError: string | undefined;

  // Step 1: DNS / Hostname Resolution
  const t1 = Date.now();
  try {
    if (host === 'localhost' || net.isIP(host)) {
      steps.push({
        step: '1_dns_resolution',
        name: 'DNS / Host Resolution',
        status: 'passed',
        durationMs: Date.now() - t1,
        details: host === 'localhost' ? 'Resolved loopback alias (localhost)' : `Direct IP address provided (${host})`,
      });
    } else {
      const lookupResult = await dns.promises.lookup(host);
      steps.push({
        step: '1_dns_resolution',
        name: 'DNS / Host Resolution',
        status: 'passed',
        durationMs: Date.now() - t1,
        details: `Hostname ${host} resolved to ${lookupResult.address}`,
      });
    }
  } catch (dnsErr: any) {
    overallSuccess = false;
    finalError = `DNS Resolution Failed: ${dnsErr.message}`;
    steps.push({
      step: '1_dns_resolution',
      name: 'DNS / Host Resolution',
      status: 'failed',
      durationMs: Date.now() - t1,
      error: dnsErr.message,
    });
    return {
      success: false,
      timestamp: new Date().toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError,
    };
  }

  // Step 2: TCP Connection Test
  const t2 = Date.now();
  const tcpPassed = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(4000);
    socket.once('connect', () => {
      resolved = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });

  if (tcpPassed) {
    steps.push({
      step: '2_tcp_connection',
      name: 'TCP Port Connectivity',
      status: 'passed',
      durationMs: Date.now() - t2,
      details: `Successfully opened TCP connection to ${host}:${port}`,
    });
  } else {
    overallSuccess = false;
    finalError = `TCP Connection Failed: Unable to establish connection to ${host}:${port} within 4000ms.`;
    steps.push({
      step: '2_tcp_connection',
      name: 'TCP Port Connectivity',
      status: 'failed',
      durationMs: Date.now() - t2,
      error: finalError,
    });
    return {
      success: false,
      timestamp: new Date().toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError,
    };
  }

  // Step 3 & 4: Authentication & Database Selection
  const t3 = Date.now();
  let conn: mysql.PoolConnection | null = null;
  try {
    const pool = getMysqlPool();
    conn = await pool.getConnection();

    steps.push({
      step: '3_authentication_and_database',
      name: 'MySQL Authentication & Database Selection',
      status: 'passed',
      durationMs: Date.now() - t3,
      details: `Authenticated as '${user}' and selected database '${database}'`,
    });
  } catch (authErr: any) {
    overallSuccess = false;
    finalError = `Authentication / Database Selection Failed: ${authErr.message}`;
    steps.push({
      step: '3_authentication_and_database',
      name: 'MySQL Authentication & Database Selection',
      status: 'failed',
      durationMs: Date.now() - t3,
      error: authErr.message,
    });
    return {
      success: false,
      timestamp: new Date().toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError,
    };
  }

  // Step 5: Simple Query Verification (SELECT 1 as ping)
  const t5 = Date.now();
  try {
    const [rows]: any = await conn.query('SELECT 1 as ping, CURRENT_TIMESTAMP as server_time');
    const pingValue = rows?.[0]?.ping;

    if (pingValue === 1) {
      steps.push({
        step: '4_query_execution',
        name: 'Query Execution (SELECT 1)',
        status: 'passed',
        durationMs: Date.now() - t5,
        details: `Query executed successfully. Server timestamp: ${rows[0]?.server_time}`,
      });
    } else {
      throw new Error(`Unexpected query return value: ${JSON.stringify(rows)}`);
    }
  } catch (queryErr: any) {
    overallSuccess = false;
    finalError = `Simple Query Execution Failed: ${queryErr.message}`;
    steps.push({
      step: '4_query_execution',
      name: 'Query Execution (SELECT 1)',
      status: 'failed',
      durationMs: Date.now() - t5,
      error: queryErr.message,
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }

  return {
    success: overallSuccess,
    timestamp: new Date().toISOString(),
    target: { host, port, database, user },
    steps,
    error: finalError,
  };
}
