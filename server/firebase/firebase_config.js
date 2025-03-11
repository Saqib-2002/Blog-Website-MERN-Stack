import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get absolute path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path
const serviceAccountPath = path.join(__dirname, "firebaseServiceKey.json");

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    "❌ Firebase service account file is missing at:",
    serviceAccountPath
  );
  process.exit(1);
}

// Read JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export default app;
