CREATE OR REPLACE FUNCTION purchase_booster(
  p_user_id UUID,
  p_booster_id UUID,
  p_price INTEGER,
  p_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS void AS $$
BEGIN
  -- Check if user has enough coins
  IF NOT EXISTS (
    SELECT 1 FROM user_parameters 
    WHERE user_id = p_user_id 
    AND coins.value >= p_price
  ) THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Deduct coins
  UPDATE user_parameters
  SET coins.value = coins.value - p_price
  WHERE user_id = p_user_id;

  -- Add booster to user's inventory
  INSERT INTO user_boosters (
    user_id,
    booster_id,
    expires_at,
    is_active
  ) VALUES (
    p_user_id,
    p_booster_id,
    p_expires_at,
    true
  );
END;
$$ LANGUAGE plpgsql; 