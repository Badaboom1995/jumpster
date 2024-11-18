CREATE OR REPLACE FUNCTION apply_jump_rewards(
  p_user_id UUID,
  p_coins INTEGER,
  p_experience INTEGER,
  p_energy_cost INTEGER
) RETURNS void AS $$
BEGIN
  -- Update user parameters
  UPDATE user_parameters
  SET 
    coins = coins + p_coins,
    energy = GREATEST(0, energy - p_energy_cost)
  WHERE user_id = p_user_id;

  -- Update user experience
  UPDATE users
  SET experience = experience + p_experience
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql; 