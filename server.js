const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── HEALTH CHECK ──────────────────────────────── */
app.get('/health', (_, res) => res.json({ ok: true }));

/* ── GENERATE SCHEDULE ─────────────────────────── */
app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured. Set ANTHROPIC_API_KEY in environment variables.' });
  }

  const { scope, clientName, address, startDate, duration } = req.body;

  if (!scope || !startDate) {
    return res.status(400).json({ error: 'scope and startDate are required.' });
  }

  const DAYS_MAP = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const startDayName = DAYS_MAP[new Date(startDate).getDay()];

  const prompt = `You are a professional construction project scheduler for Formo Renovation LLC.

Given the following scope of work, generate a detailed Gantt-style project schedule as JSON.

PROJECT INFO:
- Client: ${clientName || 'N/A'}
- Address: ${address || 'N/A'}
- Start Date: ${startDate} (${startDayName}) — NOTE: No work on Sundays
- Estimated Duration: ${duration || 'determine from scope'}

SCOPE OF WORK:
${scope}

SCHEDULING RULES:
1. Days are numbered 1..N (working days only, skip Sundays automatically)
2. Tasks within the same phase can overlap when they don't interfere
3. Mark curing/drying wait periods with type:"dry"
4. Mark tasks that block others with critical:true
5. Group work logically into phases — use codes PRE, F1, F2, F3, etc.
6. Keep task names concise (under 65 characters)
7. DO NOT include prices, costs, budgets, or number of workers
8. Add realistic "dry" pause tasks for paint, drywall, tile, adhesive where applicable
9. Show parallel work where the scope allows it
10. Be realistic — a full interior renovation is typically 10–16 days

RESPOND WITH ONLY VALID JSON — no markdown, no code fences, no explanation:
{
  "totalDays": <number>,
  "phases": [
    {
      "code": "PRE",
      "label": "Phase full name",
      "colorIndex": 0,
      "tasks": [
        { "name": "Task description", "days": [1], "type": "work", "critical": true },
        { "name": "⏳  Drying period — 24h minimum", "days": [2], "type": "dry", "critical": false }
      ]
    }
  ],
  "notes": "Any important scheduling notes for the client (optional, max 1 sentence)"
}

types: "work" | "dry" | "milestone"
days: array of day numbers this task spans, consecutive e.g. [1,2,3]`;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'x-api-key':          apiKey,
        'anthropic-version':  '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return res.status(upstream.status).json({ error: err?.error?.message || 'Anthropic API error' });
    }

    const data  = await upstream.json();
    const raw   = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const sched = JSON.parse(clean);

    return res.json(sched);

  } catch (e) {
    console.error('Generate error:', e);
    return res.status(500).json({ error: e.message });
  }
});

/* ── SPA FALLBACK ──────────────────────────────── */
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Formo Schedule running on port ${PORT}`);
});
