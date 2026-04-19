export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voiceId, speed } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API-nøkkel ikke satt opp" });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Ingen tekst" });
  }

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || "b3jcIbyC3BSnaRu8avEk"}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: parseFloat(speed) || 1.0,
        },
      }),
    }
  );

  if (!elevenRes.ok) {
    const err = await elevenRes.json().catch(() => ({}));
    return res.status(elevenRes.status).json({
      error: err?.detail?.message || "ElevenLabs-feil",
    });
  }

  res.setHeader("Content-Type", "audio/mpeg");
  const buffer = await elevenRes.arrayBuffer();
  res.send(Buffer.from(buffer));
}
