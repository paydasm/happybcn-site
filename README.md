# HappyBCN — Launch Workspace (site)

Static single-page PWA for the HappyNes Barcelona launch workspace.
Served by Netlify; live workspace data is stored in Supabase and fetched at runtime.

**Deploys:** connected to Netlify continuous deployment — every push to `main`
auto-publishes. `index.html` is the whole app; `sw.js` + `manifest.webmanifest`
+ icons are the PWA shell. `netlify.toml` sets `publish = "."` with no build step.

Do not edit `index.html` by hand in GitHub — it is generated from the working
copy and pushed here.
