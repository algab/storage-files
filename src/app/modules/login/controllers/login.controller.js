const moment = require('moment-timezone');
const crypto = require('crypto-js');
const hasha = require('hasha');

const emailService = require('../../../services/email.service');

class Login {
    constructor(app) {
        this.db = app.get('database');
        this.login = this.login.bind(this);
        this.password = this.password.bind(this);
    }

    async login({ body }, res) {
        try {
            const data = body;
            if (data.email && data.password) {
                data.password = hasha(data.password, { algorithm: 'md5' });
                const result = await this.searchLogin(data.email, data.password);
                if (result == null) {
                    res.status(404).json({ Message: 'Email or password incorret' }).end();
                } else {
                    res.status(200).json(result).end();
                }
            } else {
                res.status(400).json({ Message: 'Email and password required' }).end();
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async password({ body }, res) {
        try {
            if (body.email) {
                const user = await this.db.get('SELECT * FROM users WHERE email = ?', [body.email]);
                if (user) {
                    const password = await this.generatePassword();
                    const encryptPassword = hasha(password, { algorithm: 'md5' });
                    await this.db.run('UPDATE users SET password = ? WHERE nick = ?', [encryptPassword, user.nick]);
                    await emailService.forgotPassword(user.name, user.email, password);
                    res.status(200).json({ Message: 'Password changed successful' }).end();
                } else {
                    const manager = await this.db.get('SELECT * FROM managers WHERE email = ?', [body.email]);
                    if (manager) {
                        const password = await this.generatePassword();
                        const encryptPassword = hasha(password, { algorithm: 'md5' });
                        await this.db.run('UPDATE managers SET password = ? WHERE id = ?', [encryptPassword, manager.id]);
                        await emailService.forgotPassword(manager.name, manager.email, password);
                        res.status(200).json({ Message: 'Password changed successful' }).end();
                    } else {
                        res.status(404).json({ Message: 'Email not found' }).end();
                    }
                }
            } else {
                res.status(400).json({ Message: 'Email required' }).end();
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async searchLogin(email, password) {
        let result = null;
        const user = await this.db.get('SELECT * FROM users WHERE email = ? and password = ?', [email, password]);
        if (user) {
            const bucket = await this.db.get('SELECT * FROM buckets WHERE owner = ?', [user.nick]);
            if (bucket) {
                const privateBucket = bucket.private === 1;
                bucket.private = privateBucket;
                user.bucket = bucket;
            } else {
                user.bucket = {};
            }
            user.type = 'user';
            user.token = await this.generateToken(user.nick, user.type);
            result = user;
        } else {
            const manager = await this.db.get('SELECT * FROM managers WHERE email = ? and password = ?', [email, password]);
            if (manager) {
                manager.type = 'manager';
                manager.token = await this.generateToken(String(manager.id), user.type);
                result = manager;
            }
        }
        return result;
    }

    async generatePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXY!?@';
        let password = '';
        for (let i = 0; i < 10; i += 1) {
            password = password.concat(chars.charAt(Math.random() * 61));
        }
        return password;
    }

    async generateToken(nick, type) {
        const data = { nick, type, date: moment().tz('America/Fortaleza').format() };
        const encrypt = crypto.AES.encrypt(JSON.stringify(data), process.env.TOKEN_SECRET);
        return `Bearer ${encrypt.toString()}`;
    }
}

module.exports = app => new Login(app);
