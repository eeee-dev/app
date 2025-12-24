-- Seed Default Income Categories
-- Based on MT Connect project categories

BEGIN;

-- Get the current user ID (you'll need to replace this with actual user_id when running)
-- For now, we'll use a placeholder that you should replace
DO $$
DECLARE
  current_user_id UUID;
  zimazeb_dept_id UUID;
  boucan_dept_id UUID;
  musique_dept_id UUID;
  talent_dept_id UUID;
  moris_dept_id UUID;
  admin_dept_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please run this script while logged in.';
  END IF;

  -- Get department IDs (adjust department names as needed)
  SELECT id INTO zimazeb_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%zimaz%' LIMIT 1;
  SELECT id INTO boucan_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%bōucan%' OR name ILIKE '%boucan%' LIMIT 1;
  SELECT id INTO musique_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%musiq%' LIMIT 1;
  SELECT id INTO talent_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%tal%nt%' LIMIT 1;
  SELECT id INTO moris_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%mōris%' OR name ILIKE '%moris%' LIMIT 1;
  SELECT id INTO admin_dept_id FROM app_72505145eb_departments WHERE name ILIKE '%admin%' LIMIT 1;

  -- Insert default categories
  INSERT INTO app_72505145eb_income_categories (name, description, department_id, user_id) VALUES
    ('Creative Direction & Event Concept', 'Strategic planning and creative direction for events', zimazeb_dept_id, current_user_id),
    ('Logo Design', 'Brand identity and logo creation', zimazeb_dept_id, current_user_id),
    ('Design Derivatives', 'Flyers, patterns, backgrounds, and other design materials', zimazeb_dept_id, current_user_id),
    ('Presentation Design', 'Slide decks and presentation materials', zimazeb_dept_id, current_user_id),
    ('Screen/LED Content Management', 'Digital content for screens and LED displays', zimazeb_dept_id, current_user_id),
    ('Backdrop Animation', 'Animated backgrounds and visual effects', boucan_dept_id, current_user_id),
    ('Video Coverage', 'Event videography and video production', boucan_dept_id, current_user_id),
    ('Photography', 'Event photography and photo services', boucan_dept_id, current_user_id),
    ('Walk-in & Ambience Music', 'Background music and audio atmosphere', musique_dept_id, current_user_id),
    ('Audio Production', 'Sound design and audio editing', musique_dept_id, current_user_id),
    ('Talent Management', 'Artist and performer coordination', talent_dept_id, current_user_id),
    ('Management & Coordination', 'Project management and event coordination', moris_dept_id, current_user_id),
    ('Sustenance', 'Food, drinks, and fuel for events', admin_dept_id, current_user_id),
    ('Logistics & Transportation', 'Equipment transport and logistics', admin_dept_id, current_user_id),
    ('Other Services', 'Miscellaneous services not covered above', admin_dept_id, current_user_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded % income categories for user %', 15, current_user_id;
END $$;

COMMIT;