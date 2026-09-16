import type { APIRoute } from 'astro';
import { getLatestVersions } from '../../../lib/versions';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = await getLatestVersions();

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve version information' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};
