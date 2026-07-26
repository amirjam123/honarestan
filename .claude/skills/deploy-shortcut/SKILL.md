# Deploy Shortcut

Lightweight command shortcut for pushing to GitHub and redeploying on Vercel.

## Commands

- **1** → Push to GitHub `main` branch
- **2** → Redeploy existing Vercel project
- **1 2** or **2 1** → Push to GitHub then redeploy Vercel

## Execution Rules

- Do NOT analyze, read, index, or summarize the project before executing.
- Do NOT scan the repository unless strictly required by Git or Vercel CLI.
- Do NOT inspect files just to understand the project.
- Keep token usage as low as possible.
- Execute only the requested action and provide concise output.

---

## Step 1: Push to GitHub (command "1")

Repository: `https://github.com/amirjam123/honarestan`
Branch: `main`

### 1a. Update README.mdc

Before pushing, update `README.mdc` with:
- Every command required to run the project from scratch
- Installation steps (`npm install` or equivalent)
- Build commands
- Development commands
- Production deployment commands
- Required environment variables and their purpose
- Any additional setup needed to fully restore the project on another computer

Read the existing README.mdc and project package.json to gather this info, then edit README.mdc accordingly.

### 1b. Ensure .gitignore excludes generated folders only

Make sure `.gitignore` excludes ONLY generated/temporary artifacts:
- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `.cache/`

Do NOT exclude `.env` — the user explicitly wants it backed up in the repo.

### 1c. Commit and push

```bash
git add -A
git commit -m "update"
git push origin main
```

If nothing changed, `git commit` may fail — that's fine, just run `git push origin main`.

---

## Step 2: Redeploy Vercel (command "2")

Project: `https://vercel.com/amirs-projects-a7b6bbf6/honarestan-hadi`

```bash
vercel --prod --yes
```

Return the deployment URL from the output.

---

## Step 3: Both (command "1 2" or "2 1")

Execute Step 1 first, then Step 2. Return the Vercel deployment URL.
