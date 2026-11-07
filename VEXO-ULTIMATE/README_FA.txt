VEXO ULTIMATE — نسخه چندفایلی با بک‌اند Firebase
=================================================

این بسته شامل پیاده‌سازی سمت مرورگر و Cloud Functions است. ZIP به معنی آنلاین‌شدن خودکار نیست:
برای واقعی‌شدن سرویس‌ها باید مراحل زیر را در حساب Firebase خودت انجام بدهی و توابع را Deploy کنی.
هیچ رمز عبور، کلید خصوصی یا عبارت بازیابی کیف پول در فایل‌ها قرار داده نشده است.

قابلیت‌های پیاده‌سازی‌شده در کد
------------------------------
1) ورود و ثبت‌نام Email/Password و Google با Firebase Authentication.
2) ساخت شناسه یکتای ۱۰ رقمی در سرور؛ شناسه در صفحه Profile و Dashboard نمایش داده می‌شود.
3) کیف پول Gold / Silver / Bronze / VXB؛ مرورگر فقط موجودی را می‌خواند و تغییر موجودی فقط سمت سرور انجام می‌شود.
4) صفحه Profile واقعی: نام نمایشی، شناسه، موجودی زنده، آمار برد/باخت/مساوی، تاریخچه تراکنش و بازی.
5) بازی Bot: نتیجه تصادفی سمت سرور، برد +20 VXB و باخت تا سقف 5 VXB (موجودی منفی نمی‌شود)، سقف روزانه 200 دور برای بازیکن عادی.
6) بازی Multiplayer: صف تصادفی و اتاق خصوصی ۸ کاراکتری؛ حرکت‌ها در مسیر خصوصی سرور نگهداری می‌شوند و پس از ثبت هر دو حرکت نتیجه اعلام می‌شود.
7) پنل GOD: جست‌وجوی Player ID، نمایش مشخصات/موجودی/آمار/تاریخچه، اصلاح موجودی با دلیل، محدودسازی حساب، تنظیم سقف و گزارش ممیزی.
8) فروشگاه TON Mainnet: اتصال TON Connect، TON Proof برای تأیید مالکیت کیف پول و بررسی تراکنش در سمت سرور.
9) تنظیم تبلیغات و چهار لینک کانال از طریق پنل GOD و Firebase.

توجه: این‌ها قابلیت‌های پیاده‌سازی‌شده در فایل‌های پروژه هستند؛ تا وقتی Cloud Functions و قوانین دیتابیس Deploy نشوند، بخش‌های وابسته به سرور آنلاین و عملیاتی نخواهند شد.

نکته مهم پرداخت
---------------
فروشگاه این نسخه فقط TON Mainnet را می‌پذیرد. پرداخت Mainnet واقعی و دارای ارزش مالی است؛ قیمت‌ها و آدرس دریافت باید توسط مالک پروژه تنظیم شوند. تا قبل از تکمیل دامنه، گیرنده، قیمت‌ها و Secret، فاکتور ساخته نمی‌شود. بررسی پرداخت باید از سمت سرور انجام شود؛ اسکرین‌شات یا پیام کیف پول به‌تنهایی مدرک پرداخت نیست.

مرحله ۱ — تنظیم Firebase Web
----------------------------
1) Firebase Console > Project settings > Your apps > Web app.
2) فایل js/firebase-config.js را باز کن و مقادیر پروژه خودت را وارد کن.
3) Authentication > Sign-in method: Email/Password و Google را فعال کن.
4) Authentication > Settings > Authorized domains: دامنه GitHub Pages یا هاست خودت را اضافه کن.
5) Realtime Database را ایجاد کن.

مرحله ۲ — تنظیم قوانین دیتابیس
------------------------------
فایل firebase-database.rules.json را در Firebase Realtime Database > Rules منتشر کن.
قواعد عمداً نوشتن مستقیم از مرورگر در wallet، transactions، profiles، rooms و تنظیمات را مسدود می‌کند.
همه تغییرات مالی و بازی باید از Cloud Functions عبور کنند.

مرحله ۳ — نصب ابزارهای سرور و Deploy
------------------------------------
Cloud Functions به Node.js 20 و Firebase CLI و معمولاً پلن Blaze نیاز دارد. Windows 8 ممکن است
نسخه‌های جدید Node/Firebase CLI را پشتیبانی نکند؛ برای Deploy می‌توانی از کامپیوتر جدیدتر یا Cloud Shell استفاده کنی.

در Cloud Shell یا محیطی که Node.js 20 و Firebase CLI دارد:
  firebase login
  firebase use vexo-v2
  npm --prefix functions install
  firebase deploy --only database,functions

در صورت درخواست، Billing/Blaze را فعال کن. قبل از Deploy هزینه‌های احتمالی Functions، Database و خروجی شبکه را بررسی کن.

مرحله ۴ — فعال‌سازی GOD برای اولین بار
-------------------------------------
برای جلوگیری از راه‌اندازی عمومی و ناامن، هیچ دکمه یا تابع عمومی برای ساخت اولین GOD وجود ندارد. بعد از فعال‌شدن claim، لینک GOD Control فقط در Dashboard همان حساب نمایش داده می‌شود؛ در غیر این صورت می‌توانی مسیر admin.html را مستقیم باز کنی، اما سرور دسترسی را رد می‌کند.
ابتدا با ایمیلی که می‌خواهی حساب GOD باشد، از صفحه ثبت‌نام حساب بساز و یک بار وارد سایت شو.
سپس از یک محیط مورد اعتماد که دسترسی مالک Firebase دارد:
  cd functions
  npm install
  gcloud auth application-default login
  set GCLOUD_PROJECT=vexo-v2
  node bootstrap-god.js YOUR_GOD_ACCOUNT_EMAIL

در PowerShell به‌جای set از این دستور استفاده کن:
  $env:GCLOUD_PROJECT="vexo-v2"

پس از پیام موفقیت، از سایت خارج شو و دوباره وارد شو تا custom claim جدید دریافت شود.
فایل bootstrap-god.js را به هیچ وب‌سایت یا مخزن عمومی به‌عنوان endpoint تبدیل نکن.

ساختار اصلی
------------
index.html / login.html / dashboard.html / game.html / profile.html / store.html / admin.html
css/                         استایل‌ها
js/                          ماژول‌های Firebase و رابط کاربری
functions/index.js           توابع امن سمت سرور
functions/bootstrap-god.js   راه‌اندازی اولیه GOD از محیط مورد اعتماد
functions/.env.vexo-v2.example الگوی تنظیمات TON Mainnet
firebase-database.rules.json قوانین Realtime Database
firebase.json                تنظیمات Hosting و Functions

نکات امنیت و محدودیت
--------------------
- Firebase Hosting یا GitHub Pages فقط فایل‌های فرانت‌اند را میزبانی می‌کند؛ توابع باید جداگانه Deploy شوند.
- کد کلاینت هیچ‌گاه منبع معتبر موجودی نیست. Rules نوشتن مستقیم مالی را مسدود می‌کند.
- پرداخت فعلی TON Mainnet است و فقط پس از تنظیم آدرس، قیمت، دامنه و Secret فعال می‌شود؛ این کد Jetton را Deploy نمی‌کند.
- پاداش بازی فقط VXB است؛ بازی Gold تولید نمی‌کند. سقف ۱۰۰ Gold روزانه برای پاداش‌های Gold سمت سرور در نظر گرفته شده و فعلاً هیچ مسیر بازی Gold صادر نمی‌کند.
- چندنفره و سفارش‌ها پس از Deploy و تست دو حساب مستقل کار می‌کنند؛ تا آن زمان زنده و آنلاین محسوب نمی‌شوند.
- این پروژه بررسی حقوقی یا ممیزی امنیتی مستقل نشده است. پیش از عرضه عمومی، تست نفوذ، محدودسازی نرخ درخواست، سیاست حریم خصوصی، شرایط استفاده و الزامات قانونی پرداخت را انجام بده.


مرحله ۵ — TON Connect و پرداخت واقعی TON Mainnet
------------------------------------------------
این نسخه فروشگاه را روی TON Mainnet اجرا می‌کند. پرداخت Mainnet واقعی است و می‌تواند
دارای ارزش مالی باشد. تا قبل از تنظیم آدرس دریافت، دامنه، قیمت‌ها و API Key، فاکتور ساخته نمی‌شود.

الف) تنظیم دامنه سایت (بعداً که آدرس نهایی را دادی)
1) فایل tonconnect-manifest.json را باز کن.
2) دو آدرس نمونه YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY را با آدرس نهایی GitHub Pages
   جایگزین کن. در مقدار url آدرس پایه مخزن و در iconUrl آدرس فایل vexo-icon-180.png قرار می‌گیرد.
3) فایل باید در ریشه سایت و بدون نیاز به ورود باز شود:
   https://دامنه-تو/مسیر-مخزن/tonconnect-manifest.json
4) در functions/.env.vexo-v2 مقدار VEXO_TONCONNECT_DOMAIN فقط hostname باشد؛ برای GitHub Pages
   معمولاً YOUR-GITHUB-USERNAME.github.io است (بدون https و بدون مسیر مخزن).
5) آدرس سایت و آیکون باید HTTPS و عمومی باشند. TON Connect Manifest را پشت Authentication نگذار.

ب) تنظیم آدرس دریافت و قیمت‌ها
1) از functions/.env.vexo-v2.example یک کپی با نام دقیق functions/.env.vexo-v2 بساز.
2) VEXO_TON_MAINNET_RECEIVER را با آدرس عمومی کیف پول دریافت‌کننده Mainnet خودت جایگزین کن.
   از کیف پولی استفاده کن که کنترلش دست خودت است؛ Seed Phrase یا Private Key را وارد فایل نکن.
3) سه قیمت را به nanoTON وارد کن. هر 1 TON برابر 1,000,000,000 nanoTON است.
   مثال تبدیل: 0.1 TON = 100000000 nanoTON. این فقط مثال تبدیل است، نه پیشنهاد قیمت.
4) مقادیر فعلی عمداً placeholder هستند؛ تا وقتی قیمت‌ها را تنظیم نکنی فروشگاه فاکتور نمی‌سازد.
5) فایل .env.vexo-v2 را در GitHub آپلود نکن. .gitignore آن را مستثنا کرده است.

ج) ذخیره API Key امن در Firebase
1) از TON Center برای API Mainnet کلید بگیر.
2) در Cloud Shell یا ترمینالی که Firebase CLI دارد اجرا کن:
   firebase use vexo-v2
   firebase functions:secrets:set TONCENTER_MAINNET_API_KEY
   مقدار API Key را در prompt وارد کن؛ آن را داخل کد یا فایل عمومی قرار نده.
3) توابع نیازمند Secret هنگام Deploy به Secret Manager دسترسی خواهند داشت.

د) نصب و Deploy
در پوشه اصلی پروژه اجرا کن (یا از Google Cloud Shell استفاده کن):
   npm --prefix functions install
   firebase deploy --only database,functions
اگر Firebase درباره حذف توابع قدیمی Testnet پرسید، فقط در صورتی تأیید کن که دیگر از نسخه Testnet استفاده نمی‌کنی؛ این نسخه فقط توابع Mainnet را فراخوانی می‌کند. برای Cloud Functions ممکن است پلن Blaze
و Billing فعال لازم باشد؛ هزینه‌های احتمالی را پیش از فعال‌سازی بررسی کن.

هـ) روند اتصال و پرداخت
1) کاربر ابتدا با Firebase وارد سایت می‌شود.
2) در Store روی Connect / Verify Tonkeeper می‌زند و Tonkeeper را انتخاب می‌کند.
3) سرور یک nonce یک‌بارمصرف صادر می‌کند؛ Tonkeeper با TON Proof مالکیت کیف پول و دامنه سایت را
   امضا می‌کند. سرور امضا، آدرس، شبکه Mainnet، دامنه و زمان را بررسی می‌کند.
4) آدرس تأییدشده به UID حساب Firebase پیوند می‌خورد؛ یک کیف پول نمی‌تواند به دو حساب VEXO متصل شود.
5) کاربر فاکتور می‌سازد و انتقال را در کیف پول خودش تأیید می‌کند.
6) سرور تراکنش TON Mainnet را با فرستنده، گیرنده، مبلغ دقیق و memo یکتا بررسی می‌کند و سپس Gold
   را یک‌بار به کیف پول Firebase اضافه می‌کند. کلیک روی دکمه Verify به‌تنهایی موجودی را زیاد نمی‌کند.

محدودیت و نکات مهم
------------------
- این بسته کد اتصال TON Connect، بررسی TON Proof و مسیر پرداخت Mainnet را آماده می‌کند؛ اما تا زمانی
  که تو فایل دامنه، گیرنده، قیمت‌ها و Secret را تنظیم و Cloud Functions را Deploy نکنی، پرداخت فعال نیست.
- تراکنش‌های Mainnet واقعی و برگشت‌ناپذیرند. ابتدا فقط با مبالغ بسیار کم و حساب‌های تحت کنترل خودت
  آزمایش کن. قبل از عرضه عمومی، یک متخصص مستقل کد پرداخت را ممیزی کند.
- بررسی تراکنش از TON Center API v2 استفاده می‌کند و آخرین 100 تراکنش ورودی را می‌خواند؛ برای فروش
  پرتراکنش باید indexer/webhook یا pagination و پایش عملیاتی قوی‌تر اضافه شود.
- TON Proof این نسخه قراردادهای استاندارد Wallet V1 تا V5 شناخته‌شده را می‌پذیرد؛ اگر کیف پول با
  نوع قرارداد پشتیبانی‌نشده متصل شود، لینک‌کردن آن رد می‌شود.
- این پروژه توکن Jetton VEXO را Deploy یا Mint نمی‌کند؛ این مرحله فقط اتصال کیف پول و دریافت TON
  برای خرید Gold است. انتقال/فروش Jetton نیازمند قرارداد و جریان جداگانه است.
- هیچ‌وقت seed phrase، private key یا فایل Service Account را در سایت یا GitHub قرار نده.
