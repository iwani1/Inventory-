LUSH VIEW BAR Inventory Management System
Optimized for GreenGeeks / cPanel (PHP 8.1+ & SQLite)

==================================================
STEP-BY-STEP DEPLOYMENT GUIDE (GREENGEEKS)
==================================================

1. UPLOAD FILES
   - Log into your GreenGeeks cPanel.
   - Open File Manager.
   - Upload the CONTENTS of the `public_html/` folder into your site's `public_html/` root (or desired subfolder).
   - Overwrite existing files if prompted.

2. CONFIGURE PHP IN CPANEL
   - In cPanel, navigate to "Select PHP Version" (or "MultiPHP Manager").
   - Set the PHP version to PHP 8.1 or PHP 8.2+.
   - Under "Extensions", ensure the following are enabled (checked):
     [x] pdo_sqlite
     [x] sqlite3
     [x] session
     [x] json
     [x] opcache (recommended for speed)

3. RUN FIRST-TIME SETUP
   - Visit: https://yourdomain.com/api/install.php
   - Enter your Admin Name, Email, and Password (minimum 8 characters).
   - Click "Create admin".
   - IMPORTANT: For security, delete `api/install.php` from File Manager once installed.

4. LOG IN
   - Navigate to: https://yourdomain.com/pages/login.html
   - Log in using your admin credentials.

5. CUSTOMIZE BUSINESS NAME & CURRENCY
   - Open `assets/js/pages.js` and customize:
     window.CUR = 'GH₵';  // Your currency symbol, e.g. '$', 'GH₵', '£', '€'
     window.BIZ = 'Lush View Bar';

6. AUTOMATED DAILY BACKUPS (CPANEL CRON JOB)
   - Go to cPanel > Cron Jobs > Once Per Day (00:00 midnight).
   - Command (replace USERNAME with your cPanel username):
     sqlite3 /home/USERNAME/lushview-data/lushview.sqlite ".backup '/home/USERNAME/lushview-data/backup-$(date +\%F).sqlite'"
