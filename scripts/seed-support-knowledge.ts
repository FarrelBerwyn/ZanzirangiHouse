import { getMysqlPool } from '../server/database/connection.ts';
import { DEFAULT_KNOWLEDGE_BASE } from '../server/seedKnowledgeBase.ts';

async function seedKnowledge() {
  const pool = getMysqlPool();
  console.log(`Seeding ${DEFAULT_KNOWLEDGE_BASE.length} Knowledge Base items into Remote MySQL...`);

  for (const item of DEFAULT_KNOWLEDGE_BASE) {
    await pool.query(
      `INSERT INTO support_knowledge_base 
        (id, question, answer, category, language, status, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        question = VALUES(question),
        answer = VALUES(answer),
        category = VALUES(category),
        language = VALUES(language),
        status = VALUES(status),
        source = VALUES(source),
        updated_at = CURRENT_TIMESTAMP`,
      [
        item.id,
        item.question,
        item.answer,
        item.category || 'General',
        item.language || 'en',
        item.status || 'PUBLISHED',
        item.source || 'FAQ_IMPORT',
      ]
    );
  }

  const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM support_knowledge_base');
  console.log(`✓ Successfully seeded. Total knowledge base items in Remote MySQL: ${rows[0].count}`);

  const [samples]: any = await pool.query('SELECT id, category, question FROM support_knowledge_base LIMIT 3');
  console.log('Sample items from Remote MySQL:');
  samples.forEach((s: any) => console.log(`  - [${s.id}] (${s.category}): ${s.question}`));

  process.exit(0);
}

seedKnowledge().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
