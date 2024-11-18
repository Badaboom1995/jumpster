import { supabase } from '@/components/Root/Root';

export const activateTestBoosters = async (userId: string) => {
  try {
    // Get random boosters
    const { data: boosters } = await supabase
      .from('boosters')
      .select('*')
      .limit(3);

    if (!boosters) return;

    // Activate each booster for the user
    for (const booster of boosters) {
      const expiresAt = booster.duration_type === 'timed'
        ? new Date(Date.now() + booster.duration_value * 1000).toISOString()
        : null;

      await supabase
        .from('user_boosters')
        .insert({
          user_id: userId,
          booster_id: booster.id,
          expires_at: expiresAt,
          is_active: true
        });
    }

    console.log('Test boosters activated successfully');
  } catch (error) {
    console.error('Error activating test boosters:', error);
  }
}; 