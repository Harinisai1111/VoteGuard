
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MOCK_USERS, MOCK_VOTERS, MOCK_AUDIT_LOGS } from '../constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dataset = {
  users: MOCK_USERS,
  voters: MOCK_VOTERS,
  auditLogs: MOCK_AUDIT_LOGS
};

const outputPath = path.join(dataDir, 'original_dataset.json');

fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

console.log(`Dataset saved to ${outputPath}`);
console.log(`Users: ${dataset.users.length}`);
console.log(`Voters: ${dataset.voters.length}`);
console.log(`Audit Logs: ${dataset.auditLogs.length}`);
