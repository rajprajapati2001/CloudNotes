import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ycapnsgfzynaisogczpa.supabase.co';
const supabaseAnonKey = 'sb_publishable_TVZ_M-dTfvjQk0UKdH03Yw_4IAoJNGs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
