#!/usr/bin/env node
/**
 * Release metadata consistency check (read-only — never modifies Git or files).
 *
 *   npm run release:check              → everyday check (CI, before a PR merges)
 *   npm run release:check -- --release → strict pre-release gate (run before tagging vX.Y.Z)
 *
 * Validates that package.json, CHANGELOG.md, the release records in docs/releases/ and Git tags
 * agree with each other. See docs/RELEASE_PROCESS.md.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const strict = process.argv.includes('--release');
const errors = [];
const notes = [];

const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
};

// 1. package.json version + releaseDate
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;
const releaseDate = pkg.releaseDate ?? null;
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(String(version))) {
  errors.push(`package.json "version" is not Semantic Versioning (MAJOR.MINOR.PATCH): ${version}`);
}
if (releaseDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(releaseDate))) {
  errors.push(`package.json "releaseDate" must be null or YYYY-MM-DD: ${releaseDate}`);
}

// 2. CHANGELOG.md
const changelogPath = path.join(ROOT, 'CHANGELOG.md');
const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : null;
if (!changelog) {
  errors.push('CHANGELOG.md is missing.');
} else {
  if (!/^## \[Unreleased\]/m.test(changelog)) errors.push('CHANGELOG.md must keep a "## [Unreleased]" section at the top.');
  const escaped = String(version).replace(/\./g, '\\.');
  const entry = changelog.match(new RegExp(`^## \\[${escaped}\\] - (\\d{4}-\\d{2}-\\d{2})`, 'm'));
  if (releaseDate) {
    if (!entry) errors.push(`package.json says ${version} was released on ${releaseDate}, but CHANGELOG.md has no "## [${version}] - ${releaseDate}" entry.`);
    else if (entry[1] !== releaseDate) errors.push(`Release date mismatch: package.json ${releaseDate} vs CHANGELOG.md ${entry[1]}.`);
  } else if (entry) {
    errors.push(`CHANGELOG.md already contains [${version}] but package.json "releaseDate" is null — bump the version or set the release date.`);
  }
}

// 3. Git tags
const tag = `v${version}`;
const tagCommit = git(`rev-list -n 1 ${tag}`);
const head = git('rev-parse HEAD');
if (tagCommit && releaseDate === null) {
  errors.push(`Tag ${tag} already exists but package.json "releaseDate" is null — the next change must bump the version.`);
}
if (tagCommit && head && tagCommit !== head) {
  notes.push(`Tag ${tag} points to ${tagCommit.slice(0, 7)} (HEAD is ${head.slice(0, 7)}). Commits after a release must go into a new version.`);
}

// 4. Strict pre-release gate
if (strict) {
  if (!releaseDate) errors.push('Strict release check: set package.json "releaseDate" (YYYY-MM-DD) for the version being released.');
  const dirty = git('status --porcelain');
  if (dirty) errors.push('Strict release check: the working tree is not clean — commit or stash every change before tagging.');
  const branch = git('rev-parse --abbrev-ref HEAD');
  if (branch && !['main', 'HEAD'].includes(branch) && !branch.startsWith('release/') && !branch.startsWith('hotfix/')) {
    errors.push(`Strict release check: releases are tagged from main (or release/*, hotfix/*), current branch is "${branch}".`);
  }
  if (tagCommit && tagCommit !== head) errors.push(`Strict release check: ${tag} is already tagged on another commit. Never move or reuse a tag — bump the version.`);
  const records = [
    [`docs/releases/${tag}/CLIENT_RELEASE_NOTES.md`, 'docs/CLIENT_RELEASE_NOTES_TEMPLATE.md'],
    [`docs/releases/${tag}/TECHNICAL_RELEASE.md`, 'docs/releases/TECHNICAL_RELEASE_TEMPLATE.md'],
  ];
  for (const [file, template] of records) {
    if (!fs.existsSync(path.join(ROOT, file))) errors.push(`Strict release check: missing ${file} (copy ${template}).`);
  }
}

// Report
console.log(`Release check (${strict ? 'strict' : 'standard'}): version ${version}, releaseDate ${releaseDate ?? 'unreleased'}, tag ${tagCommit ? tag + ' present' : tag + ' not created'}`);
notes.forEach((n) => console.log(`  note: ${n}`));
if (errors.length) {
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('  ✓ Release metadata is consistent.');
