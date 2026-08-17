import { runSafeMigrationToSupabase, getMigrationStatus } from '../src/server/supabase.js';

async function main() {
  console.log('===========================================================');
  console.log('🚀 NAIJATRENDIINFO SUPABASE POSTGRESQL MIGRATION UTILITY');
  console.log('===========================================================');
  
  const status = getMigrationStatus();
  console.log('Status overview:');
  console.log(` - Supabase URL status: ${status.supabaseUrl}`);
  console.log(` - Service Role Key present: ${status.hasServiceRoleKey}`);
  console.log(` - Local articles count: ${status.articlesCountInLocalDb}`);
  console.log(` - Local categories count: ${status.categoriesCountInLocalDb}`);
  console.log('-----------------------------------------------------------');

  console.log('Executing safe, data-preserving migration...');
  const result = await runSafeMigrationToSupabase();

  if (result.success) {
    console.log('\n🎉 SUCCESS:', result.message);
    console.log('\nMigration Table Verification Summary:');
    console.table(result.report);
    process.exit(0);
  } else {
    console.warn('\n⚠️ NOTICE:', result.message);
    if (Object.keys(result.report).length > 0) {
      console.table(result.report);
    }
    process.exit(result.message.includes('not set') ? 0 : 1);
  }
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
