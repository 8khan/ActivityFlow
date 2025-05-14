const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.version) {
  const versionParts = packageJson.version.split('.').map(Number);
  if (versionParts.length === 3) {
    versionParts[2] += 1; // Increment patch version
    packageJson.version = versionParts.join('.');
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8',
    );
    console.log(`Version updated to ${packageJson.version}`);
  } else {
    console.error('Version format is invalid. Expected format: x.y.z');
  }
} else {
  console.error('No version field found in package.json');
}
