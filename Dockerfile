FROM node:20-alpine

WORKDIR /app

# نصب وابستگی‌ها
COPY package*.json ./
RUN npm install

# کپی کل پروژه
COPY . .

# ۱. ساخت فایل‌های سایت (این‌ها میرن توی پوشه dist/public)
RUN npx vite build

# ۲. حرکت حیاتی: انتقال فایل‌ها به جایی که سرور انتظار داره
# سرور دنبال server/public میگرده، پس ما فایل‌ها رو کپی میکنیم اونجا
RUN mkdir -p server/public && cp -r dist/public/* server/public/

# ساخت پوشه آپلود
RUN mkdir -p uploads

# پورت
EXPOSE 5000

# اجرا
CMD ["npx", "tsx", "server/index.ts"]
