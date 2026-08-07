# النشر — MOMENTO

- **الرابط الإنتاجي:** https://monentowatch.github.io/ma/
- **المستودع:** https://github.com/monentowatch/ma
- **الفرع:** `main`

## ⚙️ مسار القاعدة (`base`)

قيمة واحدة تحكم كل شيء: **`/ma/`** — وهي تطابق اسم المستودع `ma` حرفياً.

تظهر في أربعة مواضع يجب أن تبقى متطابقة دائماً:

| الملف | الموضع |
| --- | --- |
| `vite.config.ts` | القيمة الافتراضية لـ `base` |
| `.github/workflows/deploy.yml` | `VITE_BASE_PATH` + خطوة الحارس |
| `.github/workflows/quality.yml` | `VITE_BASE_PATH` |
| `playwright.config.ts` | `baseURL` و `url` |

خطوة الحارس تبحث عن السلسلة الكاملة `src="/ma/assets/` داخل `dist/index.html`، فتفشل فوراً عند أي اختلاف. **لا تستبدلها بـ `assets/` وحدها**: تلك تطابق أي قيمة `base` فتصبح البوابة بلا معنى ويمر CI أخضر بينما الموقع أبيض.

### إن أعدت تسمية المستودع

| الحالة الجديدة | `base` | الرابط |
| --- | --- | --- |
| اسم المستودع `monentowatch.github.io` | `/` | `https://monentowatch.github.io/` |
| أي اسم آخر، مثلاً `shop` | `/shop/` | `https://monentowatch.github.io/shop/` |

غيّر المواضع الأربعة معاً، ثم حدّث `README.md` و `public/robots.txt` و `public/sitemap.xml`.

## 🚀 خطوات النشر

1. **`Settings ← Pages ← Build and deployment ← Source = GitHub Actions`** — خطوة يدوية إجبارية مرة واحدة. بدونها تفشل خطوة `configure-pages` بالخطأ:
   `Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions.`
2. ادفع إلى `main`. يعمل `deploy.yml` تلقائياً.
3. تابع التقدم في تبويب **Actions**.
4. بعد أول نشر ناجح يظهر الرابط في `Settings ← Pages` وفي بطاقة **Deployments** على صفحة المستودع.

لا يحتاج هذا المشروع أي سر (secret).

## 🌐 معمارية الصور

الـ351 صورة ليست في هذا المستودع. تُحمَّل من:

- `https://cdn.jsdelivr.net/gh/noureddinelmobaraki-web/nl-audio-cdn@main/watch`
- واحتياطياً من `raw.githubusercontent.com`

إضافةً إلى ذلك، `index.html` يحمّل صورتي البوابة من `noureddinelmobaraki-web.github.io/nl-audio-cdn/`.

> ⚠️ **يجب أن يبقى مستودع `nl-audio-cdn` عاماً وصفحاته (Pages) مفعّلة.**
> حذفه أو جعله خاصاً يكسر كل صور المتجر. هذا المستودع يعيش في الحساب القديم `noureddinelmobaraki-web` عن قصد — **لا تحذف ذلك الحساب.**

## 🧪 البناء محلياً

```bash
npm ci --no-audit --no-fund
npm run lint
npm test
VITE_BASE_PATH=/ma/ npm run build
npm run preview -- --port 4173
```

ثم افتح `http://localhost:4173/ma/`.

للتأكد من صحة الناتج قبل الدفع:

```bash
grep -q 'src="/ma/assets/' dist/index.html && echo GUARD-OK || echo GUARD-FAIL
```

## 🧯 حل المشكلات

| العرض | السبب المحتمل | الحل |
| --- | --- | --- |
| `Get Pages site failed` / `HttpError: Not Found` | مصدر Pages غير مضبوط | نفّذ الخطوة 1 |
| فشل `Type check` في CI | `vite.config.ts` يعلن `test:` بلا إشارة أنواع Vitest | أبقِ السطر الأول `/// <reference types="vitest/config" />` |
| صفحة بيضاء | `base` لا يطابق مسار النشر | وحّد المواضع الأربعة أعلاه |
| CI أخضر والموقع أبيض | خطوة الحارس تطابق `assets/` بدل السلسلة الكاملة | أعد الحارس إلى `src="/ma/assets/` |
| `process is not defined` | حُذف `define` من `vite.config.ts` | أعده — `watches.ts:133,170` يحتاجانه |
| الصور لا تظهر | `nl-audio-cdn` خاص أو محذوف | أعده عاماً |
| اختبارات e2e تفشل | `playwright.config.ts` لا يطابق `base` | وحّدهما |
| تحذير `Node.js 20 is deprecated` | صادر عن أكشنات GitHub الرسمية | تحذير غير ضار، تجاهله |
