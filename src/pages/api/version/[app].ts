import type { APIRoute } from 'astro';
import { getPlatformHistory, getModuleHistory } from '../../../lib/versions';

export const GET: APIRoute = async ({ params }) => {
  const { app } = params;

  if (!app) {
    return new Response(
      JSON.stringify({ error: 'App or module parameter is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }

  try {
    if (app.toLowerCase() === 'history') {
      const history = await getPlatformHistory();

      return new Response(
        JSON.stringify(
          {
            platform: 'Supletivo Brasil',
            total_releases: history.length,
            history,
          },
          null,
          2
        ),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          },
        }
      );
    }

    const moduleData = await getModuleHistory(app);

    if (!moduleData) {
      return new Response(
        JSON.stringify({ error: `Module or application '${app}' not found` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    return new Response(JSON.stringify(moduleData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve module history' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};
