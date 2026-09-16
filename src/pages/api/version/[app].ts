import type { APIRoute } from 'astro';
import { getAppHistory } from '../../../lib/versions';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { app } = params;

  if (!app) {
    return new Response(
      JSON.stringify({ error: 'App parameter is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }

  try {
    const appData = await getAppHistory(app);

    if (!appData) {
      return new Response(
        JSON.stringify({ error: `Application '${app}' not found` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    return new Response(JSON.stringify(appData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve application history' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};
