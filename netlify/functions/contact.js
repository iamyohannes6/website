const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Auto-response email template
const autoResponseTemplate = {
    subject: 'Thank You for Your Message - Yohannes Goitom',
    text: 'Thank you for reaching out! I will get back to you soon.',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You for Reaching Out!</h2>
            <p>I appreciate you taking the time to contact me. I have received your message and will review it carefully.</p>
            <p>You can expect to hear back from me within 1-2 business days.</p>
            <div style="margin-top: 30px;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 0;"><strong>Yohannes Goitom</strong></p>
                <p style="margin: 0; color: #666;">Creative Director & Brand Designer</p>
            </div>
        </div>
    `
};

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { name, email, message } = JSON.parse(event.body);

        // Notification email to you
        const notificationMsg = {
            to: 'iamyohannes6@outlook.com',
            from: 'iamyohannes6@outlook.com', // Your verified sender
            subject: `New Portfolio Contact: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `
        };

        // Auto-response email
        const autoResponseMsg = {
            to: email,
            from: 'iamyohannes6@outlook.com', // Your verified sender
            subject: autoResponseTemplate.subject,
            text: autoResponseTemplate.text,
            html: autoResponseTemplate.html
        };

        // Send both emails
        await Promise.all([
            sgMail.send(notificationMsg),
            sgMail.send(autoResponseMsg)
        ]);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: true,
                message: 'Email sent successfully!'
            })
        };

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                success: false,
                message: 'Failed to send message. Please try again.'
            })
        };
    }
};
