import { testDatabaseConnection } from '../server/database/connection.ts';

async function main() {
  console.log('Testing Database Connection Diagnostic...');
  const result = await testDatabaseConnection();
  console.log('\nDiagnostic Result:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Fatal error running diagnostic:', err);
  process.exit(1);
});
