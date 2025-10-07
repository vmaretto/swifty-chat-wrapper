export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    // ✅ usa req.body (non req.json) perché siamo in runtime node
    const { recipeJson, message } = req.body;

    // 👇 Debug temporaneo
    console.log("DEBUG KEY:", process.env.OPENAI_API_KEY ? "TROVATA" : "MANCANTE");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Manca la variabile OPENAI_API_KEY nel server.");
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    // ✅ Prompt Swifty
    const prompt = `
Sei Swifty, la mascotte del progetto SWITCH Food Explorer.
Analizza la seguente ricetta e rispondi in modo chiaro, sintetico e in italiano:
${JSON.stringify(recipeJson, null, 2)}
Messaggio dell'utente: ${message}
`;

    // ✅ Chiamata API OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    // ✅ Parsing risposta
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Errore OpenAI:", data);
      return res.status(500).json({ error: data.error?.message || "Errore API OpenAI" });
    }

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Nessuna risposta da ChatGPT",
    });
  } catch (error) {
    console.error("❌ Errore server:", error);
    res.status(500).json({ error: error.message || "Errore interno del server" });
  }
}
