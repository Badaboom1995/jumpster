-- Insert test boosters
INSERT INTO boosters (name, description, rarity, duration_type, duration_value, effect_type, effect_value, icon_url) 
VALUES 
  (
    'Энергетик',
    'Увеличивает скорость восстановления энергии на 50% на 1 час',
    'common',
    'timed',
    3600, -- 1 hour in seconds
    'energy_recovery',
    1.5,
    '/icons/energy-boost.svg'
  ),
  (
    'Золотой прыжок',
    'Удваивает награду монетами за прыжки',
    'rare',
    'one_session',
    NULL,
    'coins_multiplier',
    2.0,
    '/icons/coin-boost.svg'
  ),
  (
    'Супер прыжок',
    'Увеличивает силу прыжка на 25% в следующей тренировке',
    'epic',
    'one_session',
    NULL,
    'jump_power',
    1.25,
    '/icons/jump-boost.svg'
  ),
  (
    'Экономия энергии',
    'Снижает затраты энергии на 20% навсегда',
    'legendary',
    'permanent',
    NULL,
    'energy_cost_reduction',
    0.2,
    '/icons/energy-saver.svg'
  ),
  (
    'Опытный прыгун',
    'Увеличивает получение опыта на 100% на 30 минут',
    'rare',
    'timed',
    1800, -- 30 minutes in seconds
    'experience_multiplier',
    2.0,
    '/icons/xp-boost.svg'
  ),
  (
    'Мега монеты',
    'Утраивает награду монетами на 15 минут',
    'epic',
    'timed',
    900, -- 15 minutes in seconds
    'coins_multiplier',
    3.0,
    '/icons/mega-coins.svg'
  ),
  (
    'Мастер энергии',
    'Удваивает скорость восстановления энергии навсегда',
    'legendary',
    'permanent',
    NULL,
    'energy_recovery',
    2.0,
    '/icons/energy-master.svg'
  ),
  (
    'Быстрое восстановление',
    'Увеличивает восстановление энергии на 25% на 2 часа',
    'common',
    'timed',
    7200, -- 2 hours in seconds
    'energy_recovery',
    1.25,
    '/icons/quick-recovery.svg'
  );

-- Insert some test active boosters for a test user
-- Replace 'YOUR_TEST_USER_ID' with an actual user ID from your database
-- INSERT INTO user_boosters (user_id, booster_id, expires_at, is_active)
-- SELECT 
--   'YOUR_TEST_USER_ID',
--   id,
--   CASE 
--     WHEN duration_type = 'timed' THEN NOW() + (duration_value || ' seconds')::interval
--     ELSE NULL 
--   END,
--   true
-- FROM boosters 
-- LIMIT 3; 