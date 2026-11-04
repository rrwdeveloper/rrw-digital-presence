<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## RRW architecture
- All site content (hero, about, team, services, portfolio, process, blog, FAQ, settings) lives in the database; components never hardcode it. Why: the CMS is the single source of truth.
- Public reads go through server functions in src/lib/public.functions.ts using a no-session publishable client, consumed by route loaders via src/lib/queries.ts. Why: SSR/SEO without exposing admin access.
- Admin CMS writes use the browser client under RLS; admin access is checked with the is_admin() DB function and a user_roles table. Why: privileges enforced server-side.
- Public pages live under the pathless `_site` layout; admin pages under `_authenticated/admin*` gated to /admin/login. Why: separate chrome and auth.
- Media bucket is private (workspace blocks public buckets); uploads store long-lived signed URLs. Why: images must render publicly without a public bucket.
- Admin CRUD screens are config-driven via components/admin/CrudManager + fields. Why: one tested editor for every content type.
