import nodemailer from "nodemailer";

export const sendEmailService = async (
    receiverEmail,
    subjectText,
    messageText,
    {name} = {}
) => {
console.log(receiverEmail,subjectText,messageText,'emaiiil');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.EMAIL,
        to: receiverEmail,
        subject: subjectText,
        text: messageText
    }
    await transporter.sendMail(mailOptions);
}