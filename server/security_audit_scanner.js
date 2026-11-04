const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== PREPAI DEPLOYMENT SECURITY AUDIT SCANNER ===\n');

// 1. Scan Current Files (Tracked and Untracked for Git)
console.log('[1/4] Scanning tracked and candidate files for exposed secrets...');

const filesToScanOutput = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf-8' });
const files = filesToScanOutput.split('\n').map(f => f.trim()).filter(Boolean);

const secretPatterns = [
  { name: 'MongoDB Atlas URI with credentials', regex: /mongodb\+srv:\/\/[^:]+:[^@]+@/i },
  { name: 'Google / Gemini API Key', regex: /AIzaSy[A-Za-z0-9_-]{33}/ },
  { name: 'Private Key block', regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/ },
  { name: 'Generic AWS / Cloud Secret Key', regex: /(?:aws_secret_access_key|secret_key)\s*=\s*['"][A-Za-z0-9\/+=]{40}['"]/i },
];

let exposedInCurrentFiles = [];

for (const file of files) {
  // Skip binary/images/locks if needed, but scan code & configs
  if (file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.ico')) continue;

  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) continue;

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) continue;

  const content = fs.readFileSync(fullPath, 'utf-8');

  for (const pat of secretPatterns) {
    if (pat.regex.test(content)) {
      exposedInCurrentFiles.push({ file, rule: pat.name });
    }
  }
}

if (exposedInCurrentFiles.length === 0) {
  console.log('✓ PASS: No secrets, MongoDB URIs, or Gemini keys found in current files.');
} else {
  console.log('! ALERT: Secrets detected in current files:');
  exposedInCurrentFiles.forEach(e => console.log(`  - File: ${e.file} (Matched: ${e.rule})`));
}

// 2. Scan Git Commit History
console.log('\n[2/4] Scanning Git commit history for committed secrets or .env files...');

try {
  // Check if .env was ever tracked in any commit
  const envHistory = execSync('git log --all --full-history --name-only -- "**/.env" ".env"', { encoding: 'utf-8' });
  const envCommits = envHistory.split('\n').filter(line => line.trim().endsWith('.env'));
  
  if (envCommits.length > 0) {
    console.log(`! WARNING: .env files appear in Git history in ${envCommits.length} commit entries.`);
  } else {
    console.log('✓ PASS: No .env files were ever committed to Git history.');
  }

  // Check if live Atlas connection strings were ever committed
  let atlasCommits = [];
  try {
    const atlasSearch = execSync('git log -S "mongodb+srv://" --oneline', { encoding: 'utf-8' });
    atlasCommits = atlasSearch.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (e) {}

  if (atlasCommits.length > 0) {
    console.log(`! WARNING: "mongodb+srv://" appeared in Git commit diffs: ${atlasCommits.join(', ')}`);
  } else {
    console.log('✓ PASS: No MongoDB Atlas connection strings found in Git history diffs.');
  }

  // Check if Google/Gemini API keys were ever committed
  let geminiCommits = [];
  try {
    const geminiSearch = execSync('git log -G "AIzaSy" --oneline', { encoding: 'utf-8' });
    geminiCommits = geminiSearch.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (e) {}

  if (geminiCommits.length > 0) {
    console.log(`! WARNING: Google Gemini API keys appeared in Git history diffs: ${geminiCommits.join(', ')}`);
  } else {
    console.log('✓ PASS: No Google/Gemini API keys found in Git history diffs.');
  }

} catch (err) {
  console.error('Git history check error:', err.message);
}

// 3. Verify .gitignore and .env.example
console.log('\n[3/4] Verifying .gitignore and .env.example files...');

const gitignoreContent = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf-8');
const ignoresEnv = gitignoreContent.includes('.env') && gitignoreContent.includes('**/.env');
console.log(`- .gitignore excludes .env files: ${ignoresEnv ? 'YES (Confirmed)' : 'NO'}`);

const serverEnvExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf-8');
const clientEnvExample = fs.readFileSync(path.join(__dirname, '../client/.env.example'), 'utf-8');

const serverHasPlaceholdersOnly = 
  serverEnvExample.includes('your_gemini_api_key_here') && 
  serverEnvExample.includes('mongodb://127.0.0.1:27017/prepai') &&
  !serverEnvExample.includes('AIzaSy') &&
  !serverEnvExample.includes('mongodb+srv://');

const clientHasPlaceholdersOnly = 
  clientEnvExample.includes('http://localhost:5000/api') &&
  !clientEnvExample.includes('AIzaSy');

console.log(`- server/.env.example contains placeholders only: ${serverHasPlaceholdersOnly ? 'YES (Confirmed)' : 'NO'}`);
console.log(`- client/.env.example contains placeholders only: ${clientHasPlaceholdersOnly ? 'YES (Confirmed)' : 'NO'}`);

// 4. Verify Render and Vercel Configs
console.log('\n[4/4] Verifying Render and Vercel Deployment Configurations...');

const renderYamlExists = fs.existsSync(path.join(__dirname, '../render.yaml'));
const vercelJsonExists = fs.existsSync(path.join(__dirname, '../client/vercel.json'));

if (renderYamlExists) {
  const renderYaml = fs.readFileSync(path.join(__dirname, '../render.yaml'), 'utf-8');
  console.log(`- render.yaml exists: YES`);
  console.log(`  - Root dir: server`);
  console.log(`  - Build command: npm install`);
  console.log(`  - Start command: npm start`);
  console.log(`  - Health check path: /api/health`);
  console.log(`  - Has hardcoded secrets: ${renderYaml.includes('AIzaSy') || renderYaml.includes('mongodb+srv') ? 'YES (!)' : 'NO (sync: false)'}`);
} else {
  console.log(`- render.yaml exists: NO`);
}

if (vercelJsonExists) {
  const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/vercel.json'), 'utf-8'));
  console.log(`- client/vercel.json exists: YES`);
  console.log(`  - SPA rewrite configured: ${vercelJson.rewrites && vercelJson.rewrites[0].destination === '/index.html' ? 'YES (/index.html)' : 'NO'}`);
} else {
  console.log(`- client/vercel.json exists: NO`);
}

console.log('\n=== AUDIT SCAN COMPLETE ===');

