import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'Notifikasi Semesta Manusia <onboarding@resend.dev>';

export const sendRegistrationNotification = async ({ to, name, subject, bodyHtml, subtitle }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY tidak ditemukan di .env');
    return { success: false, error: 'RESEND_API_KEY missing' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f3f4f6;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #00BFFF; padding: 32px 24px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">Semesta Manusia</h1>
                      <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 13px;">${subtitle || 'Pengumuman Penerimaan'}</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">Halo, <strong>${name}</strong>,</p>
                      <div style="color: #374151; font-size: 15px; line-height: 1.65;">
                        ${bodyHtml}
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                        Ini adalah pesan otomatis. Mohon tidak membalas email ini.<br/>
                        Semesta Manusia &copy; ${new Date().getFullYear()}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('[email] Resend response:', JSON.stringify(result, null, 2));

    if (result?.error) {
      console.error('[email] Resend error:', JSON.stringify(result.error, null, 2));
      return { success: false, error: result.error };
    }

    return { success: true, id: result?.data?.id };
  } catch (error) {
    console.error('[email] Exception saat kirim:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendRemindAccountEmail = async ({ to, name, subject }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY tidak ditemukan di .env');
    return { success: false, error: 'RESEND_API_KEY missing' };
  }

  const bodyHtml = `
    <p>Kami melihat akun Anda belum digunakan dalam waktu cukup lama. Kami ingin memastikan akun ini masih aktif dan ingin digunakan.</p>
    <p style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
      Silakan kunjungi halaman login untuk mengonfirmasi akun Anda masih ingin digunakan:<br/>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://semestamanusia.id'}/user/login" style="color: #4f46e5; font-weight: 600; text-decoration: none;">Login ke akun Anda</a>
    </p>
    <p><strong>Penting:</strong> Jika Anda tidak melakukan login dalam waktu 24 jam ke depan, akun Anda akan dihapus oleh administrator.</p>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f3f4f6;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #d97706; padding: 32px 24px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">Semesta Manusia</h1>
                      <p style="margin: 8px 0 0; color: #fef3c7; font-size: 13px;">Konfirmasi Akun</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px;">Halo, <strong>${name}</strong>,</p>
                      <div style="color: #374151; font-size: 15px; line-height: 1.65;">
                        ${bodyHtml}
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                        Ini adalah pesan otomatis. Mohon tidak membalas email ini.<br/>
                        Semesta Manusia &copy; ${new Date().getFullYear()}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('[email] Remind email sent:', JSON.stringify(result, null, 2));

    if (result?.error) {
      console.error('[email] Remind email error:', JSON.stringify(result.error, null, 2));
      return { success: false, error: result.error };
    }

    return { success: true, id: result?.data?.id };
  } catch (error) {
    console.error('[email] Exception saat kirim remind email:', error.message);
    return { success: false, error: error.message };
  }
};
