// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qbavkaluphdhrkqnlvgf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiYXZrYWx1cGhkaHJrcW5sdmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwOTM1NDQsImV4cCI6MjA0OTY2OTU0NH0.bidHjt3O-J2qVgSGFTs5gMc0XyWzuALxaL59KlNreZE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);