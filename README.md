# 🏠 Thai Life Digital Office — Deploy Guide

## โครงสร้างไฟล์
```
src/app/
  layout.tsx          — ฟอนต์ + metadata
  globals.css         — Tailwind + brand colors
  register/page.tsx   — สมัครสมาชิก (2 steps)
  login/page.tsx      — เข้าสู่ระบบ
  dashboard/page.tsx  — แก้ไขโปรไฟล์
  [slug]/
    page.tsx          — หน้า Public Profile (server)
    ProfileClient.tsx — UI component (client)
src/lib/
  supabase.ts         — Browser client
  supabase-server.ts  — Server client
  types.ts            — TypeScript types
supabase_schema.sql   — รัน 1 ครั้งใน Supabase
```

---

## ขั้นตอนที่ 1 — Supabase Setup

1. ไปที่ https://supabase.com สร้าง project ใหม่
2. ไปที่ **SQL Editor** → New Query
3. copy โค้ดทั้งหมดจาก `supabase_schema.sql` → Run
4. ไปที่ **Storage** → New Bucket
   - Name: `avatars`
   - Public: ✅ เปิด
5. ไปที่ **Project Settings → API** → copy:
   - `Project URL`
   - `anon public` key

---

## ขั้นตอนที่ 2 — Local Setup

```bash
# clone หรือ copy ไฟล์ project
npm install

# สร้าง .env.local
cp .env.local.example .env.local
# แก้ไขใส่ค่าจาก Supabase

npm run dev
# เปิด http://localhost:3000
```

---

## ขั้นตอนที่ 3 — Deploy บน Vercel

```bash
npm install -g vercel
vercel login
vercel
```

หรือใช้ **Vercel Dashboard**:
1. ไปที่ https://vercel.com → New Project
2. Import Git Repository (push โค้ดขึ้น GitHub ก่อน)
3. ใส่ Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → ได้ URL เช่น `https://thailife36.vercel.app`

---

## ขั้นตอนที่ 4 — ต่อ Custom Domain

1. ซื้อโดเมน `thailife36.com` ที่ Namecheap / GoDaddy / Cloudflare
2. ใน Vercel → Settings → Domains → Add `thailife36.com`
3. Vercel จะให้ DNS records → ไปตั้งที่ Registrar
4. รอ propagate ~5-30 นาที

---

## URL structure สุดท้าย

| URL | หน้า |
|-----|------|
| `thailife36.com/thart` | หน้าโปรไฟล์ตัวแทน |
| `thailife36.com/register` | สมัครสมาชิก |
| `thailife36.com/login` | เข้าสู่ระบบ |
| `thailife36.com/dashboard` | แก้ไขโปรไฟล์ |

---

## ขั้นต่อไป (Optional)

- [ ] Admin page สำหรับ Tart ดูภาพรวมทีม
- [ ] Analytics — นับ page views แต่ละโปรไฟล์
- [ ] LINE OA webhook แจ้งเตือนเมื่อมีลูกค้าคลิก
- [ ] Share image (OG Image) แต่ละตัวแทน
