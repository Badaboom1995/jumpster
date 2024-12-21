import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://adrdxahjylqbmxomhrmi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA",
);
