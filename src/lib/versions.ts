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

export interface VersionKV {
  get(key: string, type: 'json'): Promise<any>;
  get(key: string, type?: 'text'): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export async function getKV(): Promise<VersionKV | null> {
  try {
    const cf = await import('cloudflare:workers');
    const binding = (cf.env as any)?.PLATFORM_VERSION_KV;
    if (binding && typeof binding.get === 'function') {
      return binding as VersionKV;
    }
    return null;
  } catch {
    return null;
  }
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
  const staticSummaries = entries.map(toModuleVersionSummary);

  const kv = await getKV();
  if (!kv) {
    return staticSummaries;
  }

  try {
    const historyRaw = await kv.get('release_history', 'json');
    if (Array.isArray(historyRaw) && historyRaw.length > 0) {
      const kvSummaries = historyRaw as ModuleVersionSummary[];
      const seen = new Set<string>();
      const combined: ModuleVersionSummary[] = [];

      for (const item of kvSummaries) {
        const key = `${item.module}:${item.version}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      for (const item of staticSummaries) {
        const key = `${item.module}:${item.version}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      return combined.sort((a, b) => compareVersions(b.version, a.version));
    }
  } catch (err) {
    console.error('Failed to read release history from KV:', err);
  }

  return staticSummaries;
}

/**
 * Retrieve the current active single platform version.
 */
export async function getPlatformLatestVersion(): Promise<PlatformVersionResponse> {
  const entries = await getAllVersionEntries();

  let staticLatest: PlatformVersionResponse;
  if (entries.length === 0) {
    const now = new Date().toISOString();
    staticLatest = {
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
  } else {
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

    staticLatest = {
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

  const kv = await getKV();
  if (!kv) {
    return staticLatest;
  }

  try {
    const dynamicLatest = (await kv.get('latest_version', 'json')) as PlatformVersionResponse | null;
    if (dynamicLatest && dynamicLatest.version) {
      if (compareVersions(dynamicLatest.version, staticLatest.version) >= 0) {
        return {
          ...dynamicLatest,
          apps: {
            ...staticLatest.apps,
            ...dynamicLatest.apps,
          },
        };
      }
    }
  } catch (err) {
    console.error('Failed to read version from KV:', err);
  }

  return staticLatest;
}

/**
 * Save and dynamically persist a new platform version bump in Cloudflare KV.
 */
export async function savePlatformVersion(bumpData: {
  module: string;
  version: string;
  summary: string;
  commit: string;
  authorized_by: string;
  type: 'patch' | 'minor' | 'major';
}): Promise<PlatformVersionResponse> {
  const current = await getPlatformLatestVersion();
  const updatedApps = { ...current.apps, [bumpData.module]: bumpData.version };
  const newPlatform: PlatformVersionResponse = {
    platform: 'Supletivo Brasil',
    version: bumpData.version,
    updated_at: new Date().toISOString(),
    last_module_updated: bumpData.module,
    summary: bumpData.summary,
    commit: bumpData.commit,
    authorized_by: bumpData.authorized_by,
    type: bumpData.type,
    apps: updatedApps,
  };

  const kv = await getKV();
  if (kv) {
    try {
      await kv.put('latest_version', JSON.stringify(newPlatform));
      const historyRaw = await kv.get('release_history', 'json');
      const historyList: ModuleVersionSummary[] = Array.isArray(historyRaw) ? historyRaw : [];
      const newHistoryItem: ModuleVersionSummary = {
        version: bumpData.version,
        date: newPlatform.updated_at,
        module: bumpData.module,
        authorized_by: bumpData.authorized_by,
        commit: bumpData.commit,
        summary: bumpData.summary,
        type: bumpData.type,
        id: `${bumpData.module}-${bumpData.version}`,
      };
      const filtered = historyList.filter(
        (h) => h.id !== newHistoryItem.id && !(h.module === bumpData.module && h.version === bumpData.version)
      );
      filtered.unshift(newHistoryItem);
      await kv.put('release_history', JSON.stringify(filtered.slice(0, 100)));
    } catch (err) {
      console.error('Failed to persist version bump to KV:', err);
    }
  }

  return newPlatform;
}

/**
 * Retrieve release history for a specific module or application.
 */
export async function getModuleHistory(targetName: string): Promise<ModuleHistoryResponse | null> {
  const allHistory = await getPlatformHistory();
  const normalized = targetName.toLowerCase();

  const moduleHistory = allHistory.filter((e) => {
    const m = e.module.toLowerCase();
    return (
      m === normalized ||
      m.replace(/\.supletivo\.net\.br$/, '') === normalized ||
      m.replace(/\.v7m\.live$/, '') === normalized
    );
  });

  if (moduleHistory.length === 0) {
    return null;
  }

  const latest = moduleHistory[0];

  return {
    module: latest.module,
    platform_version: latest.version,
    last_updated_at: latest.date,
    history: moduleHistory,
  };
}
