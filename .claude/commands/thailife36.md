---
description: Thai Life Digital Office — project helper. Run /tl36 <command> to manage the app.
---

# Thai Life Digital Office — Project Skill

Project: `C:\Users\java_\Downloads\thailife36`
Live: `https://thailife36.com`
Supabase ref: `pplqrxxprbhirnrlztgx`
Supabase Management token: stored in session (ask user if not available)
GitHub: `monkeydtart-hash/thailife36`

## Commands

The user can run `/tl36 <command>`. Parse the argument and do the appropriate task:

### `/tl36 status`
- Check DB: count agents by is_active/is_admin, count news
- Check latest git commit and whether Vercel has it deployed
- Report: pending agents, total agents, latest deploy

```sql
select
  count(*) filter (where is_active = false) as pending,
  count(*) filter (where is_active = true) as active,
  count(*) filter (where is_admin = true) as admins
from public.agents;
select count(*) from public.news where is_published = true;
```

### `/tl36 approve <slug>`
Approve an agent:
```sql
update public.agents set is_active = true where slug = '<slug>';
```
Confirm with the current state after update.

### `/tl36 admin <slug>`
Set agent as admin:
```sql
update public.agents set is_admin = true where slug = '<slug>';
```

### `/tl36 agents`
List all agents with status:
```sql
select slug, full_name, is_active, is_admin, view_count, created_at
from public.agents order by created_at desc;
```

### `/tl36 news`
List all news:
```sql
select id, title, is_published, created_at from public.news order by sort_order, created_at desc;
```

### `/tl36 news add <title>`
Add a news item (ask user for content if not provided):
```sql
insert into public.news (title, content) values ('<title>', '<content>');
```

### `/tl36 views`
Show profile view counts leaderboard:
```sql
select slug, full_name, view_count from public.agents
where is_active = true order by view_count desc;
```

### `/tl36 deploy`
- Run: `cd C:\Users\java_\Downloads\thailife36 && git status && git log --oneline -5`
- Check if there are uncommitted changes
- If clean: show last 5 commits and Vercel deploy status
- If dirty: remind to commit and push

### `/tl36 fix-admin`
Check if any admin exists, if not trigger auto-fix:
```sql
select slug, is_active, is_admin from public.agents where is_admin = true;
```
If empty, ask user which slug to promote.

### `/tl36 sql <query>`
Run arbitrary SQL query on the project's Supabase database via Management API.
Use curl with the Management API token and ref.

## How to run SQL
Use curl via Bash tool:
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/pplqrxxprbhirnrlztgx/database/query" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "<sql>"}'
```

## Project architecture reminder
- RLS admin check uses `public.is_current_user_admin()` (security definer) — never inline subquery on agents
- `profile_url` is GENERATED ALWAYS — never include in UPDATE
- New agents: `is_active = false` by default
- First registered user auto-gets `is_admin = true` via trigger
- LINE URLs: `@id` → `line.me/R/ti/p/@id`, personal → `line.me/ti/p/~id`
