export default async function handler(req, res) {
  const { recipeJson, message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY; // sicuro su Vercel

  const prompt = `
  Sei Swifty, la mascotte del progetto SWITCH Food Explorer.
  Analizza la seguente ricetta e rispondi in modo chiaro e sintetico:
  ${JSON.stringify(recipeJson, null, 2)}
  Messaggio dell'utente: ${message}
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices?.[0]?.message?.content });
}
