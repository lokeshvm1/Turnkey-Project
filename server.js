/**
 * FORMA ARCHITECTS — Node.js & Nodemailer Dispatch Server
 * Handles Turnkey Project Enquiries and dispatches detailed briefs to venkatlokesh101@gmail.com
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;
const RECEIVING_EMAIL = process.env.RECEIVING_EMAIL || 'venkatlokesh101@gmail.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Configure Nodemailer Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && user !== 'your_sender_email@gmail.com') {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Fallback for development if credentials are not yet set
  return null;
}

// API Endpoint to receive turnkey inquiries
app.post('/api/send-inquiry', async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      area,
      turnkey_scope,
      structure,
      email,
      timeline,
      turnkey_details,
    } = req.body;

    // Basic validation
    if (!name || !phone || !location || !area || !turnkey_details) {
      return res.status(400).json({
        success: false,
        error: 'Missing required project parameters. Please fill in all required fields.',
      });
    }

    const refNumber = `FORMA-TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // HTML Email Template for FORMA Architects
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d0f14; color: #ffffff; margin: 0; padding: 24px; }
          .container { max-width: 650px; margin: 0 auto; background: #141720; border: 1px solid #282e3e; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1b202c 0%, #10121a 100%); padding: 32px 36px; border-bottom: 2px solid #ffb74d; }
          .eyebrow { color: #ffb74d; font-size: 11px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
          .title { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #ffffff; margin: 0; }
          .ref { font-size: 12px; color: #8892b0; margin-top: 8px; }
          .content { padding: 32px 36px; }
          .section-title { font-size: 13px; letter-spacing: 2px; color: #ffb74d; font-weight: 700; text-transform: uppercase; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #232838; padding-bottom: 6px; }
          .grid { width: 100%; border-collapse: collapse; }
          .grid td { padding: 10px 0; border-bottom: 1px solid #1c212e; vertical-align: top; }
          .label { color: #7f8ca3; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; width: 38%; }
          .value { color: #ffffff; font-size: 14px; font-weight: 500; }
          .value.highlight { color: #ffb74d; font-weight: 700; }
          .details-box { background: #0c0e13; border: 1px solid #252a38; border-radius: 6px; padding: 18px; margin-top: 16px; font-size: 14px; line-height: 1.6; color: #d1d7e5; white-space: pre-wrap; }
          .footer { background: #0b0c10; padding: 20px 36px; border-top: 1px solid #1c212e; text-align: center; font-size: 11px; color: #58637a; letter-spacing: 1px; }
          .btn-action { display: inline-block; background: #ffb74d; color: #0d0f14; text-decoration: none; font-weight: 700; font-size: 12px; letter-spacing: 1.5px; padding: 12px 24px; border-radius: 4px; margin-top: 20px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="eyebrow">NEW CLIENT SPECIFICATION BRIEF</div>
            <h1 class="title">TURNKEY PROJECT ENQUIRY</h1>
            <div class="ref">REF: #${refNumber} • Received on: ${timestamp} IST</div>
          </div>
          <div class="content">
            <div class="section-title">CLIENT &amp; CONTACT INFORMATION</div>
            <table class="grid">
              <tr>
                <td class="label">Client / Entity Name:</td>
                <td class="value highlight">${name}</td>
              </tr>
              <tr>
                <td class="label">Contact / WhatsApp:</td>
                <td class="value"><a href="tel:${phone}" style="color: #ffb74d; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr>
                <td class="label">Email Address:</td>
                <td class="value">${email ? `<a href="mailto:${email}" style="color: #ffffff;">${email}</a>` : '—'}</td>
              </tr>
            </table>

            <div class="section-title">SITE &amp; ARCHITECTURAL PARAMETERS</div>
            <table class="grid">
              <tr>
                <td class="label">Site Location:</td>
                <td class="value highlight">${location}</td>
              </tr>
              <tr>
                <td class="label">Built-Up / Plot Area:</td>
                <td class="value">${area} SQ FT</td>
              </tr>
              <tr>
                <td class="label">Turnkey Solution Scope:</td>
                <td class="value highlight">${turnkey_scope || 'Complete Turnkey (Design + Civil + Interiors + Handover)'}</td>
              </tr>
              <tr>
                <td class="label">Structure Configuration:</td>
                <td class="value">${structure || 'G+1 Duplex / Villa'}</td>
              </tr>
              <tr>
                <td class="label">Commencement Timeline:</td>
                <td class="value">${timeline || 'Within 1 to 3 Months'}</td>
              </tr>
            </table>

            <div class="section-title">DETAILED TURNKEY REQUIREMENTS</div>
            <div class="details-box">${turnkey_details}</div>

            <center>
              <a href="https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, '')}&text=Hello%20${encodeURIComponent(name)},%20thank%20you%20for%20contacting%20FORMA%20Architects%20regarding%20your%20Turnkey%20Project%20(${refNumber})." class="btn-action">
                Reply via WhatsApp
              </a>
            </center>
          </div>
          <div class="footer">
            FORMA ARCHITECTS • PRINCIPAL ATELIER COIMBATORE • CHENNAI • BENGALURU<br />
            Confidential Architectural Specification Transmission
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    if (transporter) {
      // Send live email via Nodemailer
      const mailOptions = {
        from: `"FORMA Architects" <${process.env.SMTP_USER}>`,
        to: RECEIVING_EMAIL,
        replyTo: email || undefined,
        subject: `[FORMA #${refNumber}] New Turnkey Enquiry: ${name} (${area} Sq Ft, ${location})`,
        text: `FORMA ARCHITECTS - NEW TURNKEY ENQUIRY\n\nClient: ${name}\nPhone: ${phone}\nEmail: ${email || '—'}\nLocation: ${location}\nArea: ${area} Sq Ft\nTurnkey Scope: ${turnkey_scope}\nStructure: ${structure}\nTimeline: ${timeline}\n\nRequirements:\n${turnkey_details}\n\nReference: #${refNumber}\nTimestamp: ${timestamp}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[NODEMAILER] Email transmitted successfully to ${RECEIVING_EMAIL}. MessageId: ${info.messageId}`);

      return res.status(200).json({
        success: true,
        message: `Turnkey brief successfully dispatched to ${RECEIVING_EMAIL}`,
        ref: refNumber,
        messageId: info.messageId,
      });
    } else {
      // In development or if SMTP credentials are pending in .env:
      console.log(`\n======================================================`);
      console.log(`[NODEMAILER MOCK DISPATCH] New Turnkey Enquiry Received!`);
      console.log(`Recipient: ${RECEIVING_EMAIL}`);
      console.log(`Ref: #${refNumber}`);
      console.log(`Client: ${name} | Phone: ${phone}`);
      console.log(`Location: ${location} | Area: ${area} Sq Ft`);
      console.log(`Turnkey Scope: ${turnkey_scope}`);
      console.log(`Details: ${turnkey_details}`);
      console.log(`[NOTE]: To activate live SMTP email sending, add your Gmail App Password to .env (see .env.example)`);
      console.log(`======================================================\n`);

      return res.status(200).json({
        success: true,
        message: `Turnkey brief recorded for ${RECEIVING_EMAIL}`,
        ref: refNumber,
        devNotice: 'SMTP credentials pending in .env - brief logged to console.',
      });
    }
  } catch (error) {
    console.error('[NODEMAILER ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while transmitting the turnkey brief.',
      details: error.message,
    });
  }
});

// Fallback to index.html for any root route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=========================================================`);
  console.log(`  FORMA ARCHITECTS — NODEMAILER SERVER RUNNING`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Target Recipient: ${RECEIVING_EMAIL}`);
  console.log(`=========================================================\n`);
});
