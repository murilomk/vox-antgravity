# Vercel Deploy Checklist

Use this checklist to deploy `vox-antgravity` to Vercel (GitHub -> Vercel integration).

1) In Vercel, connect the GitHub repo and set the following project settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

2) Add these Environment Variables (Vercel Dashboard -> Project -> Settings -> Environment Variables):
   - `VITE_SUPABASE_URL` = your Supabase project URL (e.g. `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
   - `GEMINI_API_KEY` = (optional) your Gemini API key if the app uses it

3) Confirm that `package.json` contains the scripts:
   - `dev`: `vite`
   - `build`: `vite build`
   - `preview`: `vite preview`

4) Local sanity checks (run locally before deploying):

```powershell
npm install
npm run build
# If build succeeds, you can preview locally
npm run preview
```

5) If the build fails in Vercel, open the Deploy Logs and copy the error output here so I can help diagnose.

6) Notes & security:
   - Do not commit secret keys to the repo. Use Vercel env vars.
   - `supabaseClient.ts` has been updated to read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`.

If you want, I can also create a `vercel.json` file with a basic configuration or update `README.md` directly. Tell me which you prefer.