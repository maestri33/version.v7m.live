import type { APIRoute } from 'astro';
import { getPlatformLatestVersion } from '../../../lib/versions';

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
    const body = (await request.json()) as Record<string, unknown>;
    const authHeader = request.headers.get('Authorization');
    const expectedToken = (import.meta.env.VERSION_BUMP_TOKEN as string) || 'supletivo-v7m-release-token';

    if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const mod = body.module as string | undefined;
    const ver = body.version as string | undefined;
    const summary = (body.summary as string) || 'Release recorded via webhook';
    const commit = (body.commit as string) || 'HEAD';
    const authorized_by = (body.authorized_by as string) || 'Víctor';
    const type = (body.type as string) || 'patch';

    if (!mod || !ver) {
      return new Response(
        JSON.stringify({ error: 'Missing mandatory fields: module and version are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    const latest = await getPlatformLatestVersion();

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
            recorded_at: new Date().toISOString(),
          },
          platform: {
            current_version: latest.version,
            last_updated: latest.updated_at,
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
