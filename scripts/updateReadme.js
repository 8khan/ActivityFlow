const fs = require('fs');
const path = require('path');

// Paths
const packageJsonPath = path.join(__dirname, '../package.json');
const readmePath = path.join(__dirname, '../README.md');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Read README.md
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Update version badge in README.md
const versionBadgeRegex =
  /\!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[0-9]+\.[0-9]+\.[0-9]+-blue\)/;
readmeContent = readmeContent.replace(
  versionBadgeRegex,
  `![Version](https://img.shields.io/badge/version-${version}-blue)`,
);

// Write updated README.md
fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log(`README.md updated to version ${version}`);
