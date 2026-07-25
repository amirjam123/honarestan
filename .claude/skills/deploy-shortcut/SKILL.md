---
name: deploy-shortcut
description: Lightweight command shortcut for pushing to GitHub and redeploying on Vercel. Trigger when user sends exactly "1", "2", or "1 2"/"2 1".
---

# Deploy Shortcut

## Commands

- **1** → Push to GitHub `main` branch
- **2** → Redeploy existing Vercel project
- **1 2** or **2 1** → Push to GitHub then redeploy Vercel

## Execution

### Step 1: Push to GitHub (command "1")

```bash
cd /home/rango/Downloads/honarestan-main\ \(2\) && git add -A && git commit -m "update" --allow-empty && git push origin main
```

### Step 2: Redeploy Vercel (command "2")

```bash
cd /home/rango/Downloads/honarestan-main\ \(2\) && vercel --prod --yes
```

### Step 3: Both (command "1 2" or "2 1")

Execute Step 1 first, then Step 2. Return the Vercel deployment URL.

## Important

- Do NOT read or analyze any project files
- Do NOT scan the repository
- Execute only the requested action
- Provide concise output
