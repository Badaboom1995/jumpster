-- Booster definitions table
CREATE TYPE booster_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE booster_duration_type AS ENUM ('one_session', 'timed', 'permanent');
CREATE TYPE booster_effect_type AS ENUM ('coins_multiplier', 'energy_recovery', 'experience_multiplier', 'jump_power', 'energy_cost_reduction');

CREATE TABLE boosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rarity booster_rarity NOT NULL,
  duration_type booster_duration_type NOT NULL,
  duration_value INTEGER, -- in seconds for timed boosters, NULL for one_session and permanent
  effect_type booster_effect_type NOT NULL,
  effect_value FLOAT NOT NULL,
  icon_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's active boosters
CREATE TABLE user_boosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booster_id UUID REFERENCES boosters(id) ON DELETE CASCADE,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, booster_id)
); 