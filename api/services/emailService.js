import nodemailer from "nodemailer";

export const sendEmailService = async (
    receiverEmail,
    subjectText,
    messageText,
    {name} = {},
    ...rest
) => {

    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
      port: 587,
      secure: false,
        auth: {
            user: process.env.NAMECHEAP_EMAIL,
            pass: process.env.NAMECHEAP_EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.NAMECHEAP_EMAIL,
        to: receiverEmail,
        subject: subjectText,
        html: messageText
    }
    await transporter.sendMail(mailOptions);
}