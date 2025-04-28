const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendPasswordResetEmail(user) {
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE,
      dynamicTemplateData: {
        name: user.name,
        resetUrl,
      },
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(user) {
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: process.env.SENDGRID_WELCOME_TEMPLATE,
      dynamicTemplateData: {
        name: user.name,
      },
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendNotification(user, notification) {
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: process.env.SENDGRID_NOTIFICATION_TEMPLATE,
      dynamicTemplateData: {
        name: user.name,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
      },
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw new Error('Failed to send notification email');
    }
  }
}

module.exports = new EmailService(); 