const { execSync } = require("child_process");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

const SUPABASE_PROJECT_ID = "adrdxahjylqbmxomhrmi";
const TYPES_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "types",
  "database.types.ts",
);

if (!SUPABASE_PROJECT_ID) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_PROJECT_ID is not defined in .env",
  );
  process.exit(1);
}

try {
  // Create types directory if it doesn't exist
  const typesDir = path.dirname(TYPES_FILE_PATH);
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  // Generate types using Supabase CLI
  const command = `npx supabase gen types typescript --project-id "${SUPABASE_PROJECT_ID}" --schema public > ${TYPES_FILE_PATH}`;
  execSync(command, { stdio: "inherit" });

  console.log("✅ Successfully updated Supabase types!");
} catch (error) {
  console.error("❌ Failed to update Supabase types:", error);
  process.exit(1);
}
