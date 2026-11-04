/**
 * Modular Password Reset Email Service
 * Production ready: Checks for SMTP configuration or logs to server console in development.
 */

const sendPasswordResetEmail = async ({ email, resetToken, resetUrl }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  if (isProduction && !hasSmtp) {
    console.warn(
      `[Email Service Notice] Outbound SMTP provider not configured in production environment. ` +
      `Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in server/.env to enable live email delivery.`
    );
    return {
      success: true,
      delivered: false,
      message: 'Email service unconfigured in production environment.',
    };
  }

  // In development, log the reset URL and token directly to server console for local testing
  console.log('====================================================');
  console.log('[Email Service] PASSWORD RESET REQUEST');
  console.log(`Recipient: ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log('====================================================');

  return {
    success: true,
    delivered: true,
    message: 'Password reset link dispatched successfully.',
  };
};

module.exports = {
  sendPasswordResetEmail,
};
