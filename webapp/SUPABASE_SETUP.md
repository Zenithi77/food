# Supabase холбох заавар

Энэ апп өгөгдлөө **Supabase** дээр `@supabase/supabase-js` клиентээр (anon/service_role түлхүүр ашиглан) хадгалдаг. Картгүй, үнэгүй tier дээр бүрэн ажиллана.

## 1. Supabase project үүсгэх

1. [supabase.com](https://supabase.com) → **"Start your project"** → GitHub/Google-оор нэвтэрнэ (карт шаардахгүй).
2. **"New project"** дарж нэр, database password, region (жишээ нь Singapore) сонгоно.
3. Хэдэн секундын дараа project бэлэн болно.

## 2. Хүснэгтүүд үүсгэх (SQL Editor)

1. Зүүн цэснээс **SQL Editor** руу ороод **"New query"** дарна.
2. Төслийн `webapp/supabase/schema.sql` файлын **бүх агуулгыг** хуулж энд буулгана.
3. **"Run"** дарна. Энэ нь `users`, `categories`, `subcategories`, `products`, `orders`, `order_items` хүснэгтүүд, индексүүд, Row Level Security бодлого, мөн захиалга үүсгэх `create_order` функцийг нэг дор үүсгэнэ.

## 3. API түлхүүрүүд авах

1. Зүүн доод ⚙️ **Project Settings → API** руу орно.
2. Дараах 3 утгыг олно:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public** key → `SUPABASE_ANON_KEY`
   - **service_role** key (нууц, **"Reveal"** дарж харна) → `SUPABASE_SERVICE_ROLE_KEY`

**Анхаар:** `service_role` түлхүүр нь Row Level Security-г бүрэн алгасаж, бүх өгөгдөлд бүрэн эрхтэй хандах тул зөвхөн сервер талд (`.env`) хадгална, хэзээ ч клиент код (browser)-д ил гаргахгүй.

## 4. `.env` файлд оруулах

`webapp/.env` файлыг нээж дараах маягаар бөглөнө:

```
JWT_SECRET="аль ч урт санамсаргүй тэмдэгт мөр"

SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."
```

## 5. Жишээ өгөгдөл оруулах

```bash
cd webapp
npm run db:seed
```

Дараах зүйлсийг үүсгэнэ:
- 6 ангилал, 2 дэд ангилал
- 17 жишээ хүнсний бараа
- Admin хэрэглэгч: `admin@khunsmarket.mn` / `admin123`
- Жишээ хэрэглэгч: `bat@example.com` / `password123`

## 6. Апп ажиллуулах

```bash
npm run dev
```

`http://localhost:3000` дээр нээгдэнэ. `/login`-оор admin эрхээр нэвтэрч `/admin`-с бараа, ангилал, захиалга удирдана.

## Vercel дээр deploy хийхдээ

Дээрх `.env`-д байгаа яг тэр 4 утгыг (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) Vercel төслийн **Settings → Environment Variables** хэсэгт нэмнэ. Ингэснээр локал орчинд ажилласан тохиргоо шууд Vercel дээр ч ажиллана.

---

### Ангиллын зураг (homepage-ийн 6 үндсэн ангиллын дэлгэц)

Хэрэв төслийг өмнө нь суулгасан бол `categories` хүснэгтэд `image_url` багана байхгүй байж болно. SQL Editor-т дараах мөрийг нэг удаа ажиллуулна уу (эсвэл `schema.sql`-ыг бүхэлд нь дахин ажиллуулж болно, идэмпотент):

```sql
alter table categories add column if not exists image_url text;
```

### Асуудал шийдвэрлэх

- **"Supabase тохиргоо дутуу байна"**: `.env`-д 3 утга зөв бөглөгдсөн эсэхийг шалгаад dev server-ээ дахин асаана уу.
- **"relation does not exist" алдаа**: `schema.sql`-ыг SQL Editor-т ажиллуулаагүй байж магадгүй — 2-р алхмыг давтана уу.
- **Захиалга үүсэхгүй байвал**: `create_order` функц зөв үүссэн эсэхийг Supabase → Database → Functions хэсгээс шалгана уу.
