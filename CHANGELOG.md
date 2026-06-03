# CHANGELOG — Thai Life Digital Office

## [Unreleased] — 2026-06-03

### ระบบ Infrastructure
- Deploy บน Vercel + เชื่อมโดเมน `thailife36.com` ผ่าน Cloudflare
- Supabase project: `pplqrxxprbhirnrlztgx`
- `site_url` และ `uri_allow_list` ตั้งค่าถูกต้องสำหรับ production

### Features ที่เพิ่ม
- **Landing page** `/` — Hero + ข่าวสารสำหรับตัวแทน + ปุ่ม login
- **ข่าวสาร dynamic** — Admin จัดการได้จาก `/admin` (เพิ่ม/ซ่อน/ลบ)
- **Admin approval system** — register แล้วรอ admin อนุมัติก่อนโปรไฟล์ขึ้น public
- **Admin Panel** `/admin` — approve/reject ตัวแทน, จัดการข่าว, ดู/แต่งตั้ง/ถอด admin
- **Admin Login แยก** `/admin/login` — หน้า login สีกรมท่า เข้าได้เฉพาะ admin
- **Forgot password** `/forgot-password` + `/reset-password`
- **Page views** — dashboard แสดง "👁 ลูกค้าเปิดดู X ครั้ง" ผ่าน RPC `increment_view_count`
- **Avatar crop** — เลือกรูปแล้วครอปวงกลมก่อนอัพโหลด (`react-easy-crop`)
- **QR download** — ดาวน์โหลด QR เป็น PNG จากหน้าโปรไฟล์
- **OG Image** — แชร์ลิงก์โปรไฟล์บน LINE/Facebook มีรูป + ชื่อ + bio
- **Admin button** — ปุ่ม Admin ใน Dashboard header เห็นเฉพาะ admin

### Bugs ที่แก้
| Bug | สาเหตุ | วิธีแก้ |
|-----|--------|---------|
| Login loop → register | `signOut()` ทุกครั้งที่ agents query fail | เช็ค error code `PGRST116` ก่อน signOut |
| Save profile ไม่ทำงาน | `profile_url` เป็น GENERATED ALWAYS column ส่งไป update ไม่ได้ | ตัด `profile_url`, `id`, `user_id`, `created_at`, `updated_at` ออกก่อน update |
| Dashboard blank page | RLS "Admin reads all agents" มี infinite recursion | เปลี่ยนเป็น `security definer` function `is_current_user_admin()` |
| Admin page prerender crash | `useRouter` ใน page.tsx โดยตรงไม่มี Suspense | แยก `AdminClient.tsx` + wrap ด้วย Suspense ใน `page.tsx` |
| Avatar upload ไม่ได้ | ไม่มี storage policies บน `avatars` bucket | เพิ่ม insert/update/select/delete policies |
| QR download ไม่ได้ | SVG → canvas มี CORS issue | เปลี่ยนเป็น `QRCodeCanvas` แล้ว `canvas.toDataURL()` ตรงเลย |
| LINE link ผิด | URL format ไม่ถูก | `@id` → `line.me/R/ti/p/@id`, personal → `line.me/ti/p/~id` |
| File picker กดไม่ได้ | ไฟล์ไม่มีนามสกุล ไม่ผ่าน `accept="image/*"` | เพิ่ม `.jpg,.jpeg,.png` ใน accept |
| Reset password ไม่แสดง | `site_url` ยังเป็น localhost, redirect URL ไม่ได้ whitelist | อัพเดต Supabase auth config ผ่าน Management API |
| TypeScript errors | `setAll(cookiesToSet)` implicit any ใน strict mode | เพิ่ม type `{ name: string; value: string; options?: any }[]` |

### SQL ที่รันใน Supabase
```sql
-- Tables
alter table public.agents add column is_admin boolean default false;
alter table public.agents add column view_count int default 0;
create table public.news (...);

-- Functions
create function public.is_current_user_admin() ... security definer
create function public.increment_view_count(agent_id uuid) ... security definer
create function public.auto_admin_first_user() ... -- trigger ตั้ง admin คนแรกอัตโนมัติ

-- Storage policies (avatars bucket)
create policy "Public read avatars" ...
create policy "Users upload own avatar" ...
create policy "Users update own avatar" ...
create policy "Users delete own avatar" ...
```

### Architecture
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (Auth + Database + Storage)
- Deploy: Vercel + Cloudflare DNS
- Session: `@supabase/ssr` `createBrowserClient` + middleware สำหรับ token refresh
- RLS: ใช้ `security definer` functions หลีกเลี่ยง infinite recursion
