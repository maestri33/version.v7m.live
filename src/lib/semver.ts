/**
 * Pure SemVer utilities for Supletivo Brasil & *.v7m.live Platform Release Train.
 */

/**
 * Compare two semver-like version strings (e.g. 0.0.0-sandbox.14 vs 0.0.0-sandbox.5).
 * Returns positive if v1 > v2, negative if v1 < v2, 0 if equal.
 */
export function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) => {
    const clean = v.trim().replace(/^v/, '');
    const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:[-.]([a-zA-Z0-9.-]+))?$/);
    if (!match) {
      return { major: 0, minor: 0, patch: 0, prerelease: clean };
    }
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || '',
    };
  };

  const p1 = parse(v1);
  const p2 = parse(v2);

  if (p1.major !== p2.major) return p1.major - p2.major;
  if (p1.minor !== p2.minor) return p1.minor - p2.minor;
  if (p1.patch !== p2.patch) return p1.patch - p2.patch;

  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && !p2.prerelease) return -1;
  if (!p1.prerelease && !p2.prerelease) return 0;

  const parts1 = p1.prerelease.split('.');
  const parts2 = p2.prerelease.split('.');
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const a = parts1[i] ?? '';
    const b = parts2[i] ?? '';
    const numA = Number(a);
    const numB = Number(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    } else {
      const cmp = a.localeCompare(b);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

/**
 * Calculate the next version string based on current version and increment type.
 * Supports standard SemVer (e.g. 1.2.3 -> 1.2.4) and prerelease format (e.g. 0.0.0-sandbox.40 -> 0.0.0-sandbox.41).
 */
export function calculateNextVersion(currentVersion: string, type: 'patch' | 'minor' | 'major' = 'patch'): string {
  const clean = currentVersion.trim().replace(/^v/, '');

  // Handles sandbox/prerelease patterns like 0.0.0-sandbox.40
  const prereleaseMatch = clean.match(/^(\d+\.\d+\.\d+)[-.]([a-zA-Z0-9.-]+?)(\d+)$/);
  if (prereleaseMatch) {
    const base = prereleaseMatch[1];
    const prefix = prereleaseMatch[2];
    const seq = parseInt(prereleaseMatch[3], 10) + 1;
    return `${base}-${prefix}${seq}`;
  }

  // Standard SemVer
  const semverMatch = clean.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (semverMatch) {
    const major = parseInt(semverMatch[1], 10);
    const minor = parseInt(semverMatch[2], 10);
    const patch = parseInt(semverMatch[3], 10);
    if (type === 'major') return `${major + 1}.0.0`;
    if (type === 'minor') return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
  }

  return `${clean}.1`;
}
