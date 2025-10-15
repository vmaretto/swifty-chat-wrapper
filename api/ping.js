export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const msg = "pong 🟢 Edge Function attiva!";
    return new Response(msg, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    return new Response("❌ Errore runtime: " + err.message, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
