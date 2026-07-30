const render = (html, data) => Object.entries(data).reduce((acc, [key, val]) => acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(val)), html);
export const paymentReceiptTemplate = (data) => render(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Receipt</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
  <h2 style="color:#2563eb;">CareerForge BD</h2>
  <p>Hi <strong>{{name}}</strong>,</p>
  <p>Your payment of <strong>{{currency}} {{amount}}</strong> on {{date}} was successful.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;border:1px solid #ddd;">Transaction ID</td><td style="padding:8px;border:1px solid #ddd;">{{transaction_id}}</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;">Amount</td><td style="padding:8px;border:1px solid #ddd;">{{currency}} {{amount}}</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;">Date</td><td style="padding:8px;border:1px solid #ddd;">{{date}}</td></tr>
  </table>
  <p>Your premium features are now active. Thank you for choosing CareerForge BD!</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#666;font-size:12px;">CareerForge BD — AI-Powered Career Development</p>
</body>
</html>`, data);
export const studyReminderTemplate = (data) => render(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Study Reminder</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
  <h2 style="color:#2563eb;">CareerForge BD</h2>
  <p>Hi <strong>{{name}}</strong>,</p>
  <p>Don't lose your streak! You're on a <strong>{{current_streak}}-day</strong> streak (longest: {{longest_streak}} days).</p>
  <p>Log in today to complete your daily tasks and keep your progress going.</p>
  <a href="{{frontend_url}}/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Continue Learning</a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#666;font-size:12px;">CareerForge BD — AI-Powered Career Development</p>
</body>
</html>`, data);
export const subscriptionExpiryTemplate = (data) => render(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Subscription Expiry Notice</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
  <h2 style="color:#2563eb;">CareerForge BD</h2>
  <p>Hi <strong>{{name}}</strong>,</p>
  <p>Your <strong>{{plan}}</strong> subscription will expire in <strong>{{days_left}} day(s)</strong>.</p>
  <p>Renew now to keep enjoying unlimited analyses, roadmaps, and interview practice.</p>
  <a href="{{frontend_url}}/pricing" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Renew Subscription</a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#666;font-size:12px;">CareerForge BD — AI-Powered Career Development</p>
</body>
</html>`, data);
//# sourceMappingURL=templates.js.map