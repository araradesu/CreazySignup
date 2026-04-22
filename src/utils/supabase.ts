import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwhpncxanjcszlqocmnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aHBuY3hhbmpjc3pscW9jbW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzExNTYsImV4cCI6MjA5MjQ0NzE1Nn0.fAV7k0WbfyyLKhltcZKunaVA-A5rKfVux8BSq_lXlZ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
