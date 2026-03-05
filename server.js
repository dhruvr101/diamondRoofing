import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.LEAD_EMAIL_USER,
    pass: process.env.LEAD_EMAIL_PASS
  }
});


const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- Load Knowledge Base (local JSON) ----
function loadKB() {
  try {
    const kbPath = path.join(process.cwd(), "kb", "roofing_kb.json");
    const raw = fs.readFileSync(kbPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(
      "⚠️ Could not load kb/roofing_kb.json. Using empty KB. Error:",
      err?.message || err
    );
    return {};
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Missing 'message' in request body." });
    }

    const KB = loadKB();

    const phone =
      KB?.business?.phone ||
      "760-410-2340";
    const license =
      KB?.business?.license ||
      "1117747";

    const systemPrompt = `
You are the official AI assistant for Diamond in the Sky Roofing (DIS).

CRITICAL INSTRUCTIONS:
- Use the Knowledge Base below as the source of truth for DIS-specific info (services, areas, contact details, license, policies).
- If the user asks something not in the Knowledge Base, say you’re not sure and suggest calling/texting ${phone}.
- Do NOT invent specific prices. If asked about cost, give general factors and suggest a free estimate.
- For emergency situations (active leak, storm damage, urgent), tell them to call/text ${phone} immediately.
- Keep answers concise, friendly, and professional.
- When relevant, include: Phone ${phone} and License #${license}.

KNOWLEDGE BASE (JSON):
${JSON.stringify(KB, null, 2)}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-10),
        { role: "user", content: message },
      ],
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim() || "Sorry—no response.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ /api/chat error:", error);
    res.status(500).json({ reply: "Something went wrong." });
  }
});
app.post("/api/lead", async (req, res) => {
  try {
    const lead = req.body;

    await transporter.sendMail({
      from: process.env.LEAD_EMAIL_USER,
      to: process.env.LEAD_TO_EMAIL,
      subject: `New Roofing Lead`,
      text: JSON.stringify(lead, null, 2)
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const data = req.body;
    const lines = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    await transporter.sendMail({
      from: process.env.LEAD_EMAIL_USER,
      to: process.env.LEAD_TO_EMAIL,
      subject: `New Estimate Request (Contact Form)`,
      text: lines,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
