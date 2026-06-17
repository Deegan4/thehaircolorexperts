// Vercel serverless function — Claude-powered product advisor for the shop.
//
// The API key lives ONLY here (in the ANTHROPIC_API_KEY env var), never in the
// browser. The front-end (js/main.js) POSTs { question, products } and receives
// { message, recommendations: [{ id, reason }] }. Product ids map back to the
// PRODUCTS catalog client-side so we can render add-to-cart cards.
//
// Requires the ANTHROPIC_API_KEY environment variable set in the Vercel project.
// Note: only runs where serverless functions execute (Vercel) — NOT on the
// GitHub Pages static deployment, where the front-end falls back gracefully.

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are the friendly product advisor for The Hair Color Experts, a boutique salon in Cape Coral, FL. A shopper describes their hair and what they want; you recommend take-home products.

Rules:
- Recommend ONLY products from the provided catalog, by their exact "id". Never invent products or ids.
- Recommend at most 3 products, fewest that genuinely fit. Order best-fit first.
- Each "reason" is one short sentence (max ~20 words) on why it fits their hair/goal.
- "message" is a warm one- or two-sentence intro to the picks. Do not list prices in it.
- If nothing in the catalog fits, return an empty recommendations array and a message gently suggesting they book a consultation or call the salon.
- Never give medical or scalp-condition advice; for those, suggest a consultation.
- Keep it on-topic: hair products. Decline unrelated requests briefly.`;

const SCHEMA = {
  type: "object",
  properties: {
    message: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          reason: { type: "string" },
        },
        required: ["id", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["message", "recommendations"],
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "The product advisor isn't configured yet." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 500) : "";
    const products = Array.isArray(body.products) ? body.products : null;

    if (!question || !products) {
      res.status(400).json({ error: "Please include a question and the product catalog." });
      return;
    }

    const catalog = products.slice(0, 60).map((p) => ({
      id: String(p.id),
      brand: String(p.brand),
      name: String(p.name),
      size: String(p.size),
      price: typeof p.price === "number" ? p.price : null,
      desc: String(p.desc || ""),
    }));

    const client = new Anthropic(); // reads ANTHROPIC_API_KEY

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: JSON.stringify({ question, catalog }),
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      res.status(200).json({
        message: "I can only help with hair products — try describing your hair and goal, or call us at (239) 257-2243.",
        recommendations: [],
      });
      return;
    }

    const text = response.content.find((b) => b.type === "text")?.text || "{}";
    const data = JSON.parse(text);

    // Defensive: only pass through recommendations for ids we actually sent.
    const validIds = new Set(catalog.map((p) => p.id));
    const recommendations = Array.isArray(data.recommendations)
      ? data.recommendations
          .filter((r) => r && validIds.has(String(r.id)))
          .slice(0, 3)
          .map((r) => ({ id: String(r.id), reason: String(r.reason || "") }))
      : [];

    res.status(200).json({
      message: typeof data.message === "string" ? data.message : "",
      recommendations,
    });
  } catch (err) {
    res.status(502).json({ error: "The advisor is unavailable right now. Please try again or call (239) 257-2243." });
  }
}
