
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovpkgrxscnbamluvuseq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cGtncnhzY25iYW1sdXZ1c2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODIzNDQsImV4cCI6MjA4MTE1ODM0NH0.lzr6PtrG7gUlW6Ug652qP9WDZAJimgqC9qlqOf_Hku0';

export const supabase = createClient(supabaseUrl, supabaseKey);
