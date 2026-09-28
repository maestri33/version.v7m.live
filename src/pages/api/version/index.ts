import type { APIRoute } from 'astro';
import { getPlatformLatestVersion, savePlatformVersion, calculateNextVersion } from '../../../lib/versions';

export const GET: APIRoute = async () => {
  try {
    const data = await getPlatformLatestVersion();

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve platform version information' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const authHeader = request.headers.get('Authorization');
    const expectedToken = (import.meta.env.VERSION_BUMP_TOKEN as string) || 'supletivo-v7m-release-token';

    if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    // 1. Normalização de módulo: aceita module, service ou repo (compatibilidade com CI/CD)
    const mod = (body.module || body.service || body.repo) as string | undefined;
    if (!mod) {
      return new Response(
        JSON.stringify({ error: 'Missing mandatory field: module, service or repo is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    const type = ((body.type as string) || 'patch') as 'patch' | 'minor' | 'major';
    const currentPlatform = await getPlatformLatestVersion();

    // 2. Auto-incremento se version não for fornecida explicitamente
    const ver = (body.version as string) || calculateNextVersion(currentPlatform.version, type);
    const summary = (body.summary as string) || `Release recorded for ${mod}`;
    const commit = (body.commit as string) || 'HEAD';
    const authorized_by = (body.authorized_by as string) || 'Víctor';

    const newPlatform = await savePlatformVersion({
      module: mod,
      version: ver,
      summary,
      commit,
      authorized_by,
      type: (type as 'patch' | 'minor' | 'major') || 'patch',
      sync_all: body.sync_all !== false,
    });

    return new Response(
      JSON.stringify(
        {
          success: true,
          message: `Release registered for ${mod} at ${ver}`,
          bump: {
            module: mod,
            version: ver,
            summary,
            commit,
            authorized_by,
            type,
            recorded_at: newPlatform.updated_at,
          },
          platform: {
            current_version: newPlatform.version,
            last_updated: newPlatform.updated_at,
          },
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload or internal error' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
