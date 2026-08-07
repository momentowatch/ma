# ⌚ MOMENTO — Casa Watch Boutique
### <sub>متجر ساعات فاخرة — الدار البيضاء، المغرب</sub>

[![Deploy](https://github.com/monentowatch/ma/actions/workflows/deploy.yml/badge.svg)](https://github.com/monentowatch/ma/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/monentowatch/ma/actions/workflows/codeql.yml/badge.svg)](https://github.com/monentowatch/ma/actions/workflows/codeql.yml)
![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)

- **الموقع المباشر:** https://monentowatch.github.io/ma/
- **المستودع:** https://github.com/monentowatch/ma

## 🗺️ المحتويات
- [الميزات](#-الميزات)
- [التقنيات](#-التقنيات)
- [بنية البيانات](#-بنية-البيانات)
- [البدء السريع](#-البدء-السريع)
- [الأوامر](#-الأوامر)
- [الاختبارات](#-الاختبارات)
- [مسار القاعدة](#-مسار-القاعدة-base)
- [النشر](#-النشر)
- [معمارية الصور (CDN)](#-معمارية-الصور-cdn)
- [الرخصة](#-الرخصة)

## ✨ الميزات
- متجر ساعات فاخرة للرجال والنساء.
- تجربة مستخدم سلسة وتصميم متجاوب.
- تكامل مع WhatsApp للطلب المباشر.

## 🧱 التقنيات
- React 19
- Vite 6
- TypeScript 5.8
- Tailwind CSS 4

## 🏛️ بنية البيانات
ملف `src/data/sa3aCatalog.ts` هو المصدر الوحيد للحقيقة لكل البيانات والأسعار. ملف `src/data/watches.ts` يشتق منه القوائم. **لا يُكتب أي سعر يدوياً في أي مكان آخر.** الكائن `CATALOG_STATS` هو المصدر الرسمي لأرقام الإحصائيات.

## ⚡ البدء السريع
```bash
npm ci
npm run dev
```

## 🛠️ الأوامر
- `npm run dev`: تشغيل خادم التطوير.
- `npm run build`: بناء النسخة النهائية.
- `npm run preview`: معاينة النسخة المبنية.
- `npm run lint`: فحص أنواع TypeScript.
- `npm test`: تشغيل اختبارات الوحدة.
- `npm run e2e`: تشغيل اختبارات Playwright.
- `npm run audit`: فحص الثغرات الأمنية.

## 🧪 الاختبارات
استخدم `npm test` للتحقق من سلامة الكتالوج، وتمنع هذه الاختبارات تسرب أسعار خارج المدى المسموح وتكرار المعرّفات للمنتجات. تستخدم اختبارات E2E إطار عمل Playwright.

## 📍 مسار القاعدة (`base`)
هذا موقع مشروع على GitHub Pages، لذلك يُقدَّم من مسار فرعي يطابق اسم المستودع:

| القيمة | |
| --- | --- |
| اسم المستودع | `ma` |
| `base` | `/ma/` |
| الرابط | `https://monentowatch.github.io/ma/` |

القيمة `/ma/` تظهر في أربعة ملفات يجب أن تبقى متطابقة دائماً: `vite.config.ts`، `deploy.yml`، `quality.yml`، `playwright.config.ts`. التفاصيل في `DEPLOYMENT.md`.

## 🚀 النشر
يتم نشر الموقع تلقائياً إلى GitHub Pages عند الدفع إلى الفرع `main`.

**خطوة يدوية إجبارية مرة واحدة:** `Settings ← Pages ← Build and deployment ← Source = GitHub Actions`. بدونها يفشل النشر بالخطأ `Get Pages site failed`.

لا يحتاج هذا المشروع أي سر (secret).

## 🖼️ معمارية الصور (CDN)
كل الصور تأتي من مستودع `nl-audio-cdn` عبر jsDelivr مع احتياطي raw.githubusercontent. **لا صورة تُحزم مع الموقع**. لذلك، أي صورة مفقودة تُصلَح في مستودع الـ CDN وليس هنا.

## 📄 الرخصة
هذا المشروع غير مرخص (UNLICENSED) وجميع الحقوق محفوظة.
