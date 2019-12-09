const jwt = require('jsonwebtoken');
const hasha = require('hasha');

const user = require('../../../schemas/user.schema');
const manager = require('../../../schemas/manager.schema');
const bucket = require('../../../schemas/bucket.schema');

const service = require('../../../services/email.service');

class LoginController {
    constructor() {
        this.user = user;
        this.manager = manager;
        this.bucket = bucket;
        this.service = service;
        this.login = this.login.bind(this);
        this.password = this.password.bind(this);
        this.generatePassword = this.generatePassword.bind(this);
    }

    async login({ headers, body, winston }, res) {
        try {
            const data = body;
            if (data.email && data.password) {
                data.password = hasha(data.password, { algorithm: 'md5' });
                const result = await this.searchLogin(data.email, data.password);
                if (result == null) {
                    res.status(404).json({ Message: 'Email or password incorret' }).end();
                } else {
                    winston.info({ email: data.email, message: 'Login' }, { agent: headers['user-agent'] });
                    res.status(200).json(result).end();
                }
            } else {
                res.status(400).json({ Message: 'Email and password required' }).end();
            }
        } catch (error) {
            winston.error({ error, message: 'Login' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async password({ headers, body, winston }, res) {
        try {
            if (body.email) {
                const result = await this.user.findOne({ where: { email: body.email }, raw: true });
                if (result) {
                    const password = this.generatePassword();
                    const encryptPassword = hasha(password, { algorithm: 'md5' });
                    await this.user.update(
                        { password: encryptPassword },
                        { where: { nick: result.nick } },
                    );
                    await this.service.forgotPassword(result.name, result.email, password);
                    winston.info({ email: body.email, message: 'User password changed' }, { agent: headers['user-agent'] });
                    res.status(200).json({ Message: 'Password changed successful' }).end();
                } else {
                    const resultManager = await this.manager.findOne({
                        where: { email: body.email }, raw: true,
                    });
                    if (resultManager) {
                        const password = this.generatePassword();
                        const encryptPassword = hasha(password, { algorithm: 'md5' });
                        await this.user.update(
                            { password: encryptPassword },
                            { where: { id: resultManager.id } },
                        );
                        await this.service.forgotPassword(
                            resultManager.name,
                            resultManager.email,
                            password,
                        );
                        winston.info({ email: body.email, message: 'Manager password changed' }, { agent: headers['user-agent'] });
                        res.status(200).json({ Message: 'Password changed successful' }).end();
                    } else {
                        res.status(404).json({ Message: 'Email not found' }).end();
                    }
                }
            } else {
                res.status(400).json({ Message: 'Email required' }).end();
            }
        } catch (error) {
            winston.error({ error, message: 'Password' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async searchLogin(email, password) {
        const result = await this.user.findOne({ where: { email, password } });
        if (result !== null) {
            const data = result.get({ plain: true });
            const bucketUser = await this.bucket.findOne({ where: { user_nick: data.nick } });
            if (bucketUser !== null) {
                data.bucket = bucketUser;
                data.token = jwt.sign({ nick: result.nick, bucket: data.bucket.name, permission: 'User' }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return data;
            }
            data.token = jwt.sign({ nick: result.nick, permission: 'User' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return data;
        }
        const resultManager = await this.manager.findOne({ where: { email, password } });
        if (resultManager) {
            const data = resultManager.get({ plain: true });
            data.token = jwt.sign({ id: data.nick, permission: 'Manager' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return data;
        }
        return null;
    }

    generatePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXY!?@';
        let password = '';
        for (let i = 0; i < 7; i += 1) {
            password = password.concat(chars.charAt(Math.random() * 64));
        }
        return password;
    }
}

module.exports = new LoginController();
