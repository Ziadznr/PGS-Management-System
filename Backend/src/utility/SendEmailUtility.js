const nodemailer = require('nodemailer');
const path = require('path');

const SendEmailUtility = async (EmailTo, EmailText, EmailSubject, attachments = []) => {
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ziadznr311@gmail.com", 
            pass: "fgvy bweu skhj cmxb" 
        }
    });

    // Map files to Nodemailer attachments format
    const formattedAttachments = attachments.map(file => ({
        filename: file.originalname || file.name, // original file name
        path: file.path // path to the file on server
    }));

    let mailOption = {
        from: "Inventory System <ziadznr311@gmail.com>",
        to: EmailTo,
        subject: EmailSubject,
        text: EmailText,
        attachments: formattedAttachments // <-- add attachments here
    };

    return await transport.sendMail(mailOption);
};

module.exports = SendEmailUtility;
