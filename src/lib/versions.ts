import { getCollection, type CollectionEntry } from 'astro:content';

export type VersionEntry = CollectionEntry<'versions'>;

export interface ModuleVersionSummary {
  version: string;
  date: string;
  module: string;
  authorized_by: string;
  commit: string;
  summary: string;
  type: 'patch' | 'minor' | 'major';
  id: string;
}

export interface PlatformVersionResponse {
  platform: string;
  version: string;
  updated_at: string;
  last_module_updated: string;
  summary: string;
  commit: string;
  authorized_by: string;
  type: 'patch' | 'minor' | 'major';
  apps: Record<string, string>;
}

export interface ModuleHistoryResponse {
  module: string;
  platform_version: string;
  last_updated_at: string;
  history: ModuleVersionSummary[];
}

function toModuleVersionSummary(entry: VersionEntry): ModuleVersionSummary {
  return {
    version: entry.data.version,
    date: entry.data.date,
    module: entry.data.module,
    authorized_by: entry.data.authorized_by,
    commit: entry.data.commit,
    summary: entry.data.summary,
    type: entry.data.type,
    id: entry.id,
  };
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
 * Fetch and sort all version entries in descending version / chronological order.
 */
export async function getAllVersionEntries(): Promise<VersionEntry[]> {
  const entries = await getCollection('versions');
  return entries.sort((a, b) => {
    const verCmp = compareVersions(b.data.version, a.data.version);
    if (verCmp !== 0) return verCmp;

    return b.data.date.localeCompare(a.data.date);
  });
}

/**
 * Retrieve the full chronological release history of the platform.
 */
export async function getPlatformHistory(): Promise<ModuleVersionSummary[]> {
  const entries = await getAllVersionEntries();
  return entries.map(toModuleVersionSummary);
}

/**
 * Retrieve the current active single platform version.
 */
export async function getPlatformLatestVersion(): Promise<PlatformVersionResponse> {
  const entries = await getAllVersionEntries();

  if (entries.length === 0) {
    const now = new Date().toISOString();
    return {
      platform: 'Supletivo Brasil',
      version: '0.0.0-sandbox.0',
      updated_at: now,
      last_module_updated: 'none',
      summary: 'No releases yet',
      commit: 'none',
      authorized_by: 'system',
      type: 'patch',
      apps: {},
    };
  }

  const latest = entries[0].data;

  const apps: Record<string, string> = {};
  for (const entry of entries) {
    const mod = entry.data.module;
    if (!apps[mod]) {
      apps[mod] = entry.data.version;
    }
  }

  const updatedAtIso = latest.date
    ? new Date(`${latest.date}T00:00:00Z`).toISOString()
    : new Date().toISOString();

  return {
    platform: 'Supletivo Brasil',
    version: latest.version,
    updated_at: updatedAtIso,
    last_module_updated: latest.module,
    summary: latest.summary,
    commit: latest.commit,
    authorized_by: latest.authorized_by,
    type: latest.type,
    apps,
  };
}

/**
 * Retrieve release history for a specific module or application.
 */
export async function getModuleHistory(targetName: string): Promise<ModuleHistoryResponse | null> {
  const entries = await getAllVersionEntries();
  const normalized = targetName.toLowerCase();

  const moduleEntries = entries.filter((e) => {
    const m = e.data.module.toLowerCase();
    return (
      m === normalized ||
      m.replace(/\.supletivo\.net\.br$/, '') === normalized ||
      m.replace(/\.v7m\.live$/, '') === normalized
    );
  });

  if (moduleEntries.length === 0) {
    return null;
  }

  const latest = moduleEntries[0].data;

  return {
    module: latest.module,
    platform_version: latest.version,
    last_updated_at: latest.date,
    history: moduleEntries.map(toModuleVersionSummary),
  };
}
