// notifier.js -- SMS va Email yuborish uchun YAGONA markaz.
// Hozircha DEMO REJIMda ishlaydi: real SMS/email yuborilmaydi, kod faqat
// server terminaliga chiqariladi. Bu ataylab shunday qilingan -- haqiqiy
// xizmat (Eskiz.uz, Twilio, SendGrid va h.k.) ulanganda, FAQAT shu faylni
// o'zgartirish kifoya -- boshqa hech qaysi joyni (auth.js va h.k.) tahrirlash
// kerak emas.
//
// REAL XIZMATGA ULASH UCHUN (keyinroq):
//   1. .env fayliga ESKIZ_EMAIL, ESKIZ_PASSWORD (yoki tanlangan xizmatning
//      kalitlarini) qo'shing.
//   2. Quyidagi sendSMS() va sendEmail() funksiyalari ichidagi
//      "DEMO REJIM" blokini xizmatning haqiqiy API chaqiruviga almashtiring.
//   3. Boshqa hech narsa o'zgarmaydi -- auth.js bu funksiyalarni chaqirib
//      turadi, ichki ishlash tafsilotidan bexabar.

function isSMSConfigured() {
  return !!(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD);
  // Boshqa xizmat tanlansa (masalan Twilio), shu yerni mos ravishda o'zgartiring:
  // return !!(process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN);
}
function isEmailConfigured() {
  return !!process.env.SENDGRID_API_KEY;
  // yoki: return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
}

/**
 * SMS yuborish (tasdiqlash kodlari uchun).
 * @param {string} phone - qabul qiluvchi telefon raqami
 * @param {string} code - 6 xonali tasdiqlash kodi
 * @returns {Promise<{sent: boolean, demo: boolean}>}
 */
async function sendSMS(phone, code) {
  if (!isSMSConfigured()) {
    // ---- DEMO REJIM: real SMS yuborilmaydi ----
    console.log(`[notifier] DEMO REJIM -- SMS yuborilmadi. ${phone} ga kod: ${code}`);
    return { sent: false, demo: true };
  }

  // ---- HAQIQIY ESKIZ.UZ INTEGRATSIYASI (kalit qo'shilganda shu blok ishlaydi) ----
  // Eskiz.uz API: avval token olinadi (POST /api/auth/login), keyin SMS yuboriladi
  // (POST /api/message/sms/send). To'liq misol: https://documenter.getpostman.com/view/663428/eskiz/7TVJc25
  try {
    // const tokenResp = await fetch('https://notify.eskiz.uz/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: process.env.ESKIZ_EMAIL, password: process.env.ESKIZ_PASSWORD }),
    // });
    // const { data } = await tokenResp.json();
    // await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` },
    //   body: JSON.stringify({ mobile_phone: phone, message: `Yurist AI tasdiqlash kodi: ${code}`, from: '4546' }),
    // });
    console.log(`[notifier] (Hali sozlanmagan -- yuqoridagi izohlarni oching) ${phone} -> ${code}`);
    return { sent: false, demo: true };
  } catch (e) {
    console.error('[notifier] SMS yuborishda xato:', e.message);
    return { sent: false, demo: true };
  }
}

/**
 * Email yuborish (tasdiqlash kodlari uchun).
 * @param {string} email - qabul qiluvchi email
 * @param {string} code - 6 xonali tasdiqlash kodi
 * @returns {Promise<{sent: boolean, demo: boolean}>}
 */
async function sendEmail(email, code) {
  if (!isEmailConfigured()) {
    // ---- DEMO REJIM: real email yuborilmaydi ----
    console.log(`[notifier] DEMO REJIM -- Email yuborilmadi. ${email} ga kod: ${code}`);
    return { sent: false, demo: true };
  }

  // ---- HAQIQIY SENDGRID INTEGRATSIYASI (kalit qo'shilganda shu blok ishlaydi) ----
  try {
    // await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email }] }],
    //     from: { email: 'noreply@yuristai.uz', name: 'Yurist AI' },
    //     subject: 'Tasdiqlash kodi',
    //     content: [{ type: 'text/plain', value: `Sizning tasdiqlash kodingiz: ${code}` }],
    //   }),
    // });
    console.log(`[notifier] (Hali sozlanmagan -- yuqoridagi izohlarni oching) ${email} -> ${code}`);
    return { sent: false, demo: true };
  } catch (e) {
    console.error('[notifier] Email yuborishda xato:', e.message);
    return { sent: false, demo: true };
  }
}

/**
 * Identifikator turi (email/telefon) ga qarab to'g'ri kanaldan yuboradi.
 */
async function sendVerificationCode(identifier, code, isEmailType) {
  return isEmailType ? sendEmail(identifier, code) : sendSMS(identifier, code);
}

module.exports = { sendSMS, sendEmail, sendVerificationCode, isSMSConfigured, isEmailConfigured };
