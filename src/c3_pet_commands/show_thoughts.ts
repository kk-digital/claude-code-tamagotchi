// Display recent AI-generated thoughts
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

interface Observation {
  id: number;
  thought: string;
  mood: string;
  created_at: string;
}

export async function showThoughts(): Promise<void> {
  const dbPath = join(homedir(), '.claude', 'pets', 'feedback.db');

  console.log('🧠 Pet Thoughts & Observations\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check if feedback database exists
  if (!existsSync(dbPath)) {
    console.log('❌ No thoughts database found');
    console.log('\nThe AI feedback system hasn\'t been initialized yet.');
    console.log('\nTo enable AI thoughts:');
    console.log('  1. Set PET_FEEDBACK_ENABLED=true in .env');
    console.log('  2. Ensure LM Studio is running');
    console.log('  3. Work in Claude Code (thoughts generate automatically)');
    console.log('\nDatabase will be created at:');
    console.log(`  ${dbPath}`);
    return;
  }

  try {
    // Try to use sqlite3 if available, otherwise use bun:sqlite
    let observations: Observation[] = [];

    try {
      // Try bun:sqlite first
      const { Database } = await import('bun:sqlite');
      const db = new Database(dbPath, { readonly: true });

      const query = db.query(`
        SELECT id, thought, mood, created_at
        FROM observations
        ORDER BY created_at DESC
        LIMIT 10
      `);

      observations = query.all() as Observation[];
      db.close();
    } catch (sqliteError) {
      // Fallback: use command line sqlite3 if bun:sqlite not available
      const { spawnSync } = await import('child_process');
      const result = spawnSync('sqlite3', [
        dbPath,
        'SELECT id, thought, mood, created_at FROM observations ORDER BY created_at DESC LIMIT 10;'
      ], { encoding: 'utf-8' });

      if (result.status === 0 && result.stdout) {
        // Parse pipe-separated output
        observations = result.stdout
          .trim()
          .split('\n')
          .map(line => {
            const [id, thought, mood, created_at] = line.split('|');
            return { id: parseInt(id), thought, mood, created_at };
          });
      } else {
        throw new Error('Failed to query database');
      }
    }

    if (observations.length === 0) {
      console.log('💭 No thoughts yet...\n');
      console.log('Your pet hasn\'t observed anything interesting yet.');
      console.log('\nThoughts are generated automatically when:');
      console.log('  • You work in Claude Code');
      console.log('  • Claude edits files');
      console.log('  • Claude runs commands');
      console.log('  • Claude searches code');
      console.log('\nJust keep working and thoughts will appear!');
      return;
    }

    console.log(`Recent Observations (${observations.length} most recent):\n`);

    for (const obs of observations) {
      const date = new Date(obs.created_at);
      const timeAgo = getTimeAgo(date);
      const moodEmoji = getMoodEmoji(obs.mood);

      console.log(`${moodEmoji} ${obs.thought}`);
      console.log(`   ${timeAgo} · Mood: ${obs.mood}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Tip: Thoughts appear in the statusline as: 💭 "thought text"');

  } catch (error: any) {
    console.log('❌ Error reading thoughts database\n');
    console.log(`Error: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('  1. Check if database file exists and is readable');
    console.log('  2. Ensure feedback system is enabled (PET_FEEDBACK_ENABLED=true)');
    console.log('  3. Try running: sqlite3 ' + dbPath + ' "SELECT COUNT(*) FROM observations;"');
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    'happy': '😊',
    'content': '🙂',
    'concerned': '😕',
    'annoyed': '😠',
    'angry': '😡',
    'excited': '🤩',
    'curious': '🤔',
    'playful': '😄',
    'tired': '😴',
    'hungry': '🍖',
    'sad': '😢'
  };

  return moodMap[mood.toLowerCase()] || '💭';
}
