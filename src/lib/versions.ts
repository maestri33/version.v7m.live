import { getCollection, type CollectionEntry } from 'astro:content';

export type VersionEntry = CollectionEntry<'versions'>;

export interface AppVersionSummary {
  version: string;
  date: string;
  authorized_by: string;
  commit: string;
  summary: string;
  type: 'patch' | 'minor' | 'major';
  id: string;
}

export interface AppHistoryResponse {
  app: string;
  current_version: string;
  updated_at: string;
  history: AppVersionSummary[];
}

export interface LatestVersionsResponse {
  apps: Record<string, string>;
  updated_at: string;
}

/**
 * Compare two semver-like version strings (e.g. 0.0.0-sandbox.14 vs 0.0.0-sandbox.5)
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

  // If one has no prerelease, it is a stable release (greater than prerelease)
  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && !p2.prerelease) return -1;
  if (!p1.prerelease && !p2.prerelease) return 0;

  // Compare prerelease identifiers chunk by chunk
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
 * Fetch and sort all version entries in descending chronological / semver order.
 */
export async function getAllVersionEntries(): Promise<VersionEntry[]> {
  const entries = await getCollection('versions');
  return entries.sort((a, b) => {
    // 1. Sort by date descending
    const dateCmp = b.data.date.localeCompare(a.data.date);
    if (dateCmp !== 0) return dateCmp;

    // 2. Sort by version descending if date is identical
    return compareVersions(b.data.version, a.data.version);
  });
}

/**
 * Retrieve the latest version for each registered application.
 */
export async function getLatestVersions(): Promise<LatestVersionsResponse> {
  const entries = await getAllVersionEntries();
  const apps: Record<string, string> = {};
  let latestDate = '';

  for (const entry of entries) {
    const { app, version, date } = entry.data;
    if (!apps[app]) {
      apps[app] = version;
    }
    if (!latestDate || date.localeCompare(latestDate) > 0) {
      latestDate = date;
    }
  }

  // Format updated_at as ISO string (e.g. 2026-09-16T00:00:00Z)
  const updatedAtIso = latestDate
    ? new Date(`${latestDate}T00:00:00Z`).toISOString()
    : new Date().toISOString();

  return {
    apps,
    updated_at: updatedAtIso,
  };
}

/**
 * Retrieve current version and change history for a specific application.
 */
export async function getAppHistory(appName: string): Promise<AppHistoryResponse | null> {
  const entries = await getAllVersionEntries();
  const appEntries = entries.filter(
    (e) => e.data.app.toLowerCase() === appName.toLowerCase()
  );

  if (appEntries.length === 0) {
    return null;
  }

  const latest = appEntries[0];
  const history: AppVersionSummary[] = appEntries.map((e) => ({
    version: e.data.version,
    date: e.data.date,
    authorized_by: e.data.authorized_by,
    commit: e.data.commit,
    summary: e.data.summary,
    type: e.data.type,
    id: e.id,
  }));

  return {
    app: latest.data.app,
    current_version: latest.data.version,
    updated_at: latest.data.date,
    history,
  };
}
