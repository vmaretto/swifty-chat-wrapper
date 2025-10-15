export const config = { runtime: 'edge' };

export default async () =>
  new Response("pong 🟢 Edge Function attiva!", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
