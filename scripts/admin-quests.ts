// import { createClient } from '@supabase/supabase-js';
// import { createClient } from '@supabase/supabase-js';
// import { Command } from 'commander';

const { createClient } = require('@supabase/supabase-js');
const { Command } = require('commander');

const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA" || ''
);

const program = new Command();

program
  .name('quest-admin')
  .description('CLI to manage quests and rewards');

program.command('add-quest')
  .description('Add a new quest')
  .requiredOption('-t, --title <title>', 'Quest title')
  .requiredOption('-d, --description <description>', 'Quest description')
  .requiredOption('-p, --points <points>', 'Points reward')
  .requiredOption('-y, --type <type>', 'Quest type (social_media, telegram, etc)')
  .option('-l, --link <link>', 'Quest link')
  .action(async (options) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .insert([{
          title: options.title,
          description: options.description,
          points: parseInt(options.points),
          quest_type: options.type,
          link: options.link
        }]);

      if (error) throw error;
      console.log('Quest added successfully:', data);
    } catch (error) {
      console.error('Error adding quest:', error);
    }
  });

program.command('list-quests')
  .description('List all quests')
  .action(async () => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*');

      if (error) throw error;
      console.table(data);
    } catch (error) {
      console.error('Error listing quests:', error);
    }
  });

program.command('deactivate-quest')
  .description('Deactivate a quest')
  .requiredOption('-i, --id <id>', 'Quest ID')
  .action(async (options) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update({ active: false })
        .eq('id', options.id);

      if (error) throw error;
      console.log('Quest deactivated successfully');
    } catch (error) {
      console.error('Error deactivating quest:', error);
    }
  });

program.parse(); 