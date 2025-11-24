
const sendResetPwdLink = (resetLink) => {
  const html = `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
      <h2 style="text-align: center; color: #444;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset the password for your account associated with this email address.</p>
      <p>If you made this request, please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in 15 minutes for security reasons.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <br>
      <p>Thank you,<br><strong>Algomatic Team</strong></p>
    </div>`;
  return html;
};

const paymentSuccessFull = ({ name, metaAccountNo, paymentId, transactionId, amount }) => {
  return `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background-color: #0052cc; padding: 20px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Payment Successful</h1>
          </div>
          
          <div style="padding: 30px; text-align: left;">
            <p style="font-size: 18px; color: #333;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Thank you for your payment. We’ve successfully processed your transaction. Below are your payment details:</p>
            
            <table style="width: 100%; margin-top: 20px; font-size: 15px; color: #333; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Meta Account No:</td>
                <td style="padding: 8px;">${metaAccountNo}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px; font-weight: bold;">Payment ID:</td>
                <td style="padding: 8px;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Amount:</td>
                <td style="padding: 8px;">$${amount}</td>
              </tr>
            </table>
  
            <div style="text-align: center; margin-top: 30px;">
              <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Payment Success" style="width: 80px; height: 80px;" />
              <p style="color: #28a745; font-weight: bold; font-size: 18px; margin-top: 10px;">Your payment was processed successfully!</p>
            </div>
  
            <p style="font-size: 14px; color: #888; margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
          </div>
          
          <div style="background-color: #f0f2f5; padding: 15px 30px; text-align: center; font-size: 13px; color: #888;">
            © ${new Date().getFullYear()} Algomatic. All rights reserved.
          </div>
        </div>
      </div>
    `;
};

const sendOTP = (to, otp) => {
    const html = `
    <div style="background-color: #f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border: 1px solid #e0e0e0;">
        
        <h2 style="text-align: center; color: #333333; margin-bottom: 20px;">Verify Your Email</h2>
        
        <p style="font-size: 16px; color: #555555;">Hi there,</p>
        
        <p style="font-size: 16px; color: #555555;">
          Please use the following One-Time Password (OTP) to complete your verification. This OTP is valid for the next <strong>60 seconds</strong>:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f0f4ff; padding: 15px 30px; border-radius: 6px; font-size: 28px; letter-spacing: 6px; color: #0037ff; font-weight: bold;">
            ${otp}
          </div>
        </div>
  
        <p style="font-size: 16px; color: #555555;">
          If you did not request this, you can safely ignore this email.
        </p>
        
        <p style="font-size: 16px; color: #555555;">Thanks,<br><strong>Algomatic Team</strong></p>
      </div>
    </div>
    `;
    return html;
  };
  

module.exports = {
  sendOTP,
  sendResetPwdLink,
  paymentSuccessFull,
};
