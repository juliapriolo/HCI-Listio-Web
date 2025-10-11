Email templates for LISTIO

Files:
- verification.html: HTML template for verification / forgot-password emails. Uses simple placeholders:
  - {{VERIFICATION_CODE}} - the code to show
  - {{ACTION_URL}} - url for one-click verification
  - {{EXPIRY_MINUTES}} - expiry in minutes
  - {{YEAR}} - current year

- verification.txt: Plain-text alternative for clients that don't render HTML.

Integration notes:
- These templates run on the backend or email provider (SendGrid, Mailgun, SES, Nodemailer, etc.). The frontend cannot change the outgoing email content because emails are sent by the server.
- To use:
  1. Load the chosen template on the server and replace placeholders with actual values.
  2. Send email with both HTML and text versions (multipart/alternative).
  3. Set proper email headers and a from address like "Listio <no-reply@yourdomain.com>".

Example (Node.js, nodemailer):

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({ /* smtp or service */ })

const html = fs.readFileSync('verification.html', 'utf8')
const body = html.replace('{{VERIFICATION_CODE}}', code)
  .replace('{{ACTION_URL}}', url)
  .replace('{{EXPIRY_MINUTES}}', '15')
  .replace('{{YEAR}}', new Date().getFullYear())

await transporter.sendMail({
  from: 'Listio <no-reply@yourdomain.com>',
  to: user.email,
  subject: 'Tu código de verificación - Listio',
  text: fs.readFileSync('verification.txt', 'utf8').replace('{{VERIFICATION_CODE}}', code).replace('{{ACTION_URL}}', url).replace('{{EXPIRY_MINUTES}}', '15').replace('{{YEAR}}', new Date().getFullYear()),
  html: body
})

Security & UX tips:
- Do not include sensitive tokens in query strings if possible. Prefer one-time codes stored server-side.
- Add brand visuals and your support contact if appropriate.
- Make expiry short (10-30 minutes) and mention it in the email.
- Consider using a short URL with domain branding for action links.
