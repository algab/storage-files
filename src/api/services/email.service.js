const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.forgotPassword = this.forgotPassword.bind(this);
    }

    async forgotPassword(name, email, password) {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        transporter.sendMail({
            from: `Storage Files <${process.env.EMAIL_USER}>`,
            to: `${name} <${email}>`,
            subject: 'Alteração de Senha',
            html: `Olá ${name}, <br/><br/> A sua nova senha é ${password}. <br/> Lembre-se de alterar esta senha ao fazer login.`,
        });
    }
}

module.exports = new EmailService();
