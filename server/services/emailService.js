/**
 * Modular Password Reset Email Service
 * In development, logs the reset URL and token directly to server console.
 * Easily extended for SMTP/SendGrid in production.
 */
const sendPasswordResetEmail = async ({ email, resetToken, resetUrl }) => {
  console.log('====================================================');
  console.log('[Email Service] PASSWORD RESET REQUEST');
  console.log(`Recipient: ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log('====================================================');

  return {
    success: true,
    message: 'Password reset link sent (Logged to console in dev mode)',
  };
};

module.exports = {
  sendPasswordResetEmail,
};
