const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_GMAIL,
        pass: process.env.ADMIN_GMAIL_PASSWORD
    }
});


const sendAbsentEmail = async (to, subject, name, reason) => {
    try {
        const info = await transporter.sendMail({
            from: `"Attendance System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: absentHtmlBuilder(name, to, reason)
        });

        console.log("***************************");
        console.log("Email sent:", info.messageId);
        console.log("***************************");

    }
    catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

function absentHtmlBuilder(name, email, reason) {

    // reason = "ABSENT" or "LATE"

    return `
            <html>
                <head>
                    <meta charset="UTF-8">
                        <title>Attendance Notice</title>
                </head>
                <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">

                    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
                        <tr>
                            <td>
                                <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

                                    <!-- Header -->
                                    <tr>
                                        <td style="background:#2c3e50; padding:20px; text-align:center; color:#ffffff;">
                                            <h2 style="margin:0;">Attendance Notification</h2>
                                        </td>
                                    </tr>

                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:30px; color:#333;">

                                            <p style="font-size:16px;">Hello <strong>${name}</strong>,</p>

                                            <p style="font-size:15px; line-height:1.6;">
                                                This is to inform you that your attendance status has been recorded as:
                                            </p>

                                            <p style="text-align:center; margin:25px 0;">
                                                <span style="
                                        display:inline-block;
                                        padding:12px 25px;
                                        font-size:18px;
                                        color:#ffffff;
                                        border-radius:5px;
                                        background:${reason === 'ABSENT' ? '#e74c3c' : '#f39c12'};
                                    ">
                                                    ${reason}
                                                </span>
                                            </p>

                                            <p style="font-size:15px; line-height:1.6;">
                                                If you believe this is incorrect or have a valid reason, please contact the administration.
                                            </p>

                                            <p style="font-size:15px; margin-top:30px;">
                                                Regards,<br />
                                                <strong>Shinjiro / GUSTO</strong>
                                            </p>

                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background:#ecf0f1; padding:15px; text-align:center; font-size:12px; color:#777;">
                                            This email was sent to ${email}<br />
                                            © ${new Date().getFullYear()} All rights reserved.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>

                </body>
            </html>
    `;
}

module.exports = {
    sendAbsentEmail
}