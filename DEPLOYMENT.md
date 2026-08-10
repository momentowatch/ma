# النشر — MOMENTO

**الرابط الإنتاجي:** https://momentowatch.github.io/ma/
**المستودع:** https://github.com/monentowatch/ma

## ⚙️ مسار القاعدة (`base`)

قيمة واحدة تحكم كل شيء: `/ma/`

تظهر في أربعة مواضع يجب أن تبقى متطابقة دائماً:

| الملف | الموضع |
| --- | --- |
| `vite.config.ts` | القيمة الافتراضية لـ `base` |
| `.github/workflows/deploy.yml` | `VITE_BASE_PATH` + خطوة الحارس |
| `.github/workflows/quality.yml` | `VITE_BASE_PATH` |
| `playwright.config.ts` | `baseURL` و `url` |

إن غيّرت اسم المستودع، **غيّر الأربعة معاً**. خطوة الحارس تقارن ناتج البناء الفعلي بـ `/ma/` فتفشل فوراً عند أي اختلاف.

## 🚀 خطوات النشر

1. `Settings ← Pages ← Source = GitHub Actions` — **خطوة يدوية إجبارية مرة واحدة، قبل أول دفع.** بدونها يفشل النشر بـ `Failed to create deployment (404)`.
2. ادفع إلى `main`. يعمل `deploy.yml` تلقائياً.
3. تابع التقدم في تبويب **Actions**.

لا يحتاج هذا المشروع أي سر (secret).

## 🌐 معمارية الصور

الـ351 صورة ليست في هذا المستودع. تُحمَّل من:

- `https://cdn.jsdelivr.net/gh/noureddinelmobaraki-web/nl-audio-cdn@main/watch`
- واحتياطياً من `raw.githubusercontent.com`

إضافةً إلى ذلك، `index.html` يحمّل صورتي البوابة من `noureddinelmobaraki-web.github.io/nl-audio-cdn/`.

> ⚠️ **يجب أن يبقى مستودع `nl-audio-cdn` عاماً وصفحاته (Pages) مفعّلة.**
> حذفه أو جعله خاصاً يكسر كل صور المتجر.

## 🧪 البناء محلياً

```bash
npm ci --no-audit --no-fund
npm run lint
npm test
VITE_BASE_PATH=/ma/ npm run build
npm run preview -- --port 4173
```

ثم افتح `http://localhost:4173/ma/`.

## 🧯 حل المشكلات

| العرض | السبب المحتمل | الحل |
|---|---|---|
| فشل `Type check` في CI | `vite.config.ts` يعلن `test:` بلا إشارة أنواع Vitest | أبقِ السطر `/// <reference types="vitest/config" />` في أعلى الملف |
| صفحة بيضاء | `base` لا يطابق مسار النشر | وحّد المواضع الأربعة أعلاه |
| `process is not defined` | حُذف `define` من `vite.config.ts` | أعده — `watches.ts:133,170` يحتاجانه |
| الصور لا تظهر | `nl-audio-cdn` خاص أو محذوف | أعده عاماً |
| `Failed to create deployment (404)` | مصدر Pages غير مضبوط | نفّذ الخطوة 1 |
| اختبارات e2e تفشل | `playwright.config.ts` لا يطابق `base` | وحّدهما |
