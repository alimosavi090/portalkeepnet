# Secure-DataVault

پلتفرم پشتیبانی VPN/V2Ray با پنل مدیریت حرفه‌ای

## 🚀 ویژگی‌ها

- ✅ پنل ادمین کامل با احراز هویت امن
- ✅ مدیریت پلتفرم‌ها و اپلیکیشن‌ها
- ✅ سیستم آموزش با پشتیبانی متن، ویدیو و تصویر
- ✅ سیستم اعلانات
- ✅ پشتیبانی دو زبانه (فارسی/انگلیسی)
- ✅ طراحی Material Design 3
- ✅ Responsive و RTL support

## 📋 پیش‌نیازها

- Node.js 20+
- PostgreSQL 14+
- npm یا yarn

## 🛠️ نصب و راه‌اندازی

### 1. Clone کردن پروژه

```bash
git clone <repository-url>
cd Secure-DataVault
```

### 2. نصب Dependencies

```bash
npm install
```

### 3. تنظیم Environment Variables

فایل `.env.example` را کپی کنید:

```bash
cp .env.example .env
```

سپس فایل `.env` را ویرایش کنید و مقادیر زیر را تنظیم کنید:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/secure_datavault
SESSION_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=development
PORT=5000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

> **نکته امنیتی**: `SESSION_SECRET` باید یک رشته تصادفی حداقل 32 کاراکتری باشد. می‌توانید با دستور زیر یکی بسازید:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. راه‌اندازی Database

ابتدا یک database در PostgreSQL بسازید:

```bash
createdb secure_datavault
```

سپس schema را push کنید:

```bash
npm run db:push
```

### 5. ایجاد Admin اولیه

برای ایجاد اولین admin، از migration استفاده کنید یا مستقیماً در database:

```sql
INSERT INTO admins (username, password) 
VALUES ('admin', '$2b$10$...');  -- از bcrypt hash استفاده کنید
```

یا از کد Node.js:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
// سپس در database ذخیره کنید
```

### 6. اجرای پروژه

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm run build
npm start
```

پروژه روی `http://localhost:5000` در دسترس خواهد بود.

## 📁 ساختار پروژه

```
Secure-DataVault/
├── client/              # Frontend React
│   ├── public/         # فایل‌های استاتیک
│   └── src/
│       ├── components/ # کامپوننت‌های React
│       ├── pages/      # صفحات اصلی
│       ├── lib/        # Utilities و helpers
│       └── hooks/      # Custom hooks
├── server/             # Backend Express
│   ├── index.ts        # Entry point
│   ├── routes.ts       # API routes
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── upload.ts       # File upload handler
├── shared/             # کد مشترک
│   └── schema.ts       # Database schema (Drizzle)
├── uploads/            # فایل‌های آپلود شده
└── migrations/         # Database migrations
```

## 🔐 امنیت

- رمزهای عبور با bcrypt hash می‌شوند
- Session-based authentication
- CORS و rate limiting فعال
- Input validation با Zod
- Secure cookies (httpOnly, sameSite)

## 🎨 UI/UX

پروژه از **Material Design 3** استفاده می‌کند با:
- Radix UI components
- Tailwind CSS
- Inter font family
- Dark/Light theme
- RTL support برای فارسی

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - ورود
- `POST /api/v1/auth/logout` - خروج
- `GET /api/v1/auth/me` - اطلاعات کاربر فعلی

### Platforms
- `GET /api/v1/platforms` - لیست پلتفرم‌ها
- `POST /api/v1/platforms` - ایجاد پلتفرم (نیاز به auth)
- `PATCH /api/v1/platforms/:id` - ویرایش (نیاز به auth)
- `DELETE /api/v1/platforms/:id` - حذف (نیاز به auth)

### Applications
- `GET /api/v1/applications?platformId=X` - لیست اپلیکیشن‌ها
- `POST /api/v1/applications` - ایجاد (نیاز به auth)
- `PATCH /api/v1/applications/:id` - ویرایش (نیاز به auth)
- `DELETE /api/v1/applications/:id` - حذف (نیاز به auth)

### Tutorials
- `GET /api/v1/tutorials?category=X` - لیست آموزش‌ها
- `POST /api/v1/tutorials` - ایجاد (نیاز به auth)
- `PATCH /api/v1/tutorials/:id` - ویرایش (نیاز به auth)
- `DELETE /api/v1/tutorials/:id` - حذف (نیاز به auth)

### Announcements
- `GET /api/v1/announcements?active=true` - لیست اعلانات
- `POST /api/v1/announcements` - ایجاد (نیاز به auth)
- `PATCH /api/v1/announcements/:id` - ویرایش (نیاز به auth)
- `DELETE /api/v1/announcements/:id` - حذف (نیاز به auth)

### Upload
- `POST /api/v1/upload/image` - آپلود عکس (نیاز به auth)
- `DELETE /api/v1/upload/image/:filename` - حذف عکس (نیاز به auth)
- `GET /uploads/:filename` - دریافت عکس

## 🧪 دستورات مفید

```bash
# Type checking
npm run check

# Database push (بدون migration)
npm run db:push

# Build برای production
npm run build

# اجرای production build
npm start
```

## 🐳 Docker

برای اجرا با Docker:

```bash
docker-compose up
```

## 📚 مستندات بیشتر

- [Deployment Guide](./DEPLOYMENT.md) - راهنمای استقرار
- [Design Guidelines](./design_guidelines.md) - راهنمای طراحی UI

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. یک branch جدید بسازید
3. تغییرات خود را commit کنید
4. Push کنید و Pull Request بسازید

## 📄 License

MIT

## 🆘 پشتیبانی

برای گزارش مشکلات یا پیشنهادات، از Issues استفاده کنید.

---

**ساخته شده با ❤️ برای جامعه VPN ایران**
