# Formo Renovation — Project Schedule Generator

AI-powered project schedule generator with Formo branding. Paste any scope of work → get a professional Gantt-style schedule with disclaimers, ready to print as PDF.

---

## Files

```
formo-app/
├── server.js          ← Express backend (proxies Anthropic API)
├── package.json
├── public/
│   └── index.html     ← Full frontend app
└── README.md
```

---

## Deploy to Render (Free tier)

### 1. Push to GitHub
1. Create a new GitHub repo: `formo-schedule`
2. Upload all files maintaining the folder structure above
3. Commit and push

### 2. Create Web Service on Render
1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub account and select the `formo-schedule` repo
3. Fill in:
   - **Name:** `formo-schedule`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

### 3. Set Environment Variable (THE IMPORTANT PART)
In your Render service → **Environment** tab → Add:
```
Key:   ANTHROPIC_API_KEY
Value: sk-ant-api03-xxxxxxxxxxxxxxxxxx
```
This keeps your API key **100% secure** — never in the code, never in the browser.

### 4. Deploy
Click **Create Web Service**. In ~2 minutes your app will be live at:
```
https://formo-schedule.onrender.com
```

---

## Usage

1. Open the app URL
2. Enter client name, address, start date, estimated duration
3. Paste the scope of work
4. Click **Generate Project Schedule**
5. Click **Print / Save PDF** to save as a PDF file

The app automatically:
- Skips Sundays from the calendar
- Identifies drying/curing periods
- Marks critical tasks
- Adds professional disclaimers
- Applies Formo Renovation branding

---

## Update API Key
Go to Render Dashboard → Your Service → **Environment** → Edit `ANTHROPIC_API_KEY`

## Cost
~$0.02–0.05 per schedule generated (Claude Sonnet tokens)
