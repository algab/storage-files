const hasha = require('hasha');
const jwt = require('jsonwebtoken');

const user = require('../../../schemas/user.schema');

class UserController {
    constructor() {
        this.user = user;
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.token = this.token.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save({ headers, body, winston }, res) {
        try {
            const data = body;
            const countEmail = await this.user.count({ where: { email: data.email } });
            if (countEmail === 0) {
                const countNick = await this.user.count({ where: { nick: data.nick } });
                if (countNick === 0) {
                    if (data.password) {
                        data.password = hasha(data.password, { algorithm: 'md5' });
                        const result = await this.user.create(data);
                        winston.info({ Message: 'User save', user: result }, { agent: headers['user-agent'] });
                        res.status(201).json(data).end();
                    } else {
                        res.status(400).json({ Message: 'Password is required' }).end();
                    }
                } else {
                    res.status(409).json({ Message: 'Nick already exists' }).end();
                }
            } else {
                res.status(409).json({ Message: 'Email conflict' }).end();
            }
        } catch (error) {
            winston.error({ error, message: 'User save' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async list(req, res) {
        try {
            const data = await this.user.findAll({ attributes: { exclude: ['password'] } });
            res.status(200).json(data).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async search({ params }, res) {
        try {
            const data = await this.user.findByPk(params.nick, { attributes: { exclude: ['password'] } });
            res.status(200).json(data).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async edit({ headers, body, params, winston }, res) {
        try {
            const result = await this.user.findOne({ where: { nick: params.nick } });
            if (body.email === result.email) {
                delete body.password;
                await this.user.update(body, { where: { nick: params.nick } });
                winston.info({ nick: params.nick, message: 'User update' }, { agent: headers['user-agent'] });
                res.status(200).json({ Message: 'User updated successful' }).end();
            } else {
                const countEmail = await this.user.count({ where: { email: body.email } });
                if (countEmail === 0) {
                    delete body.password;
                    await this.user.update(body, { where: { nick: params.nick } });
                    winston.info({ nick: params.nick, message: 'User update' }, { agent: headers['user-agent'] });
                    res.status(200).json({ Message: 'User updated successful' }).end();
                } else {
                    res.status(409).json({ Message: 'Email already exists' }).end();
                }
            }
        } catch (error) {
            winston.error({ error, message: 'User edit' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async password({ headers, body, params, winston }, res) {
        try {
            if (body.password) {
                const password = hasha(body.password, { algorithm: 'md5' });
                await this.user.update({ password }, { where: { nick: params.nick } });
                winston.info({ nick: params.nick, message: 'User password' }, { agent: headers['user-agent'] });
                res.status(200).json({ Message: 'Password changed successful' }).end();
            } else {
                res.status(400).json({ Message: 'Password is required' }).end();
            }
        } catch (error) {
            winston.error({ error, message: 'User password' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async token({ headers, params, winston }, res) {
        try {
            const token = jwt.sign({ nick: params.nick, permission: 'App' }, process.env.JWT_SECRET);
            winston.info({ nick: params.nick, message: 'User token' }, { agent: headers['user-agent'] });
            res.status(200).json({ token }).end();
        } catch (error) {
            winston.error({ error, message: 'User token' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async delete({ headers, params, winston }, res) {
        try {
            await this.user.destroy({ where: { nick: params.nick } });
            winston.info({ nick: params.nick, message: 'User delete' }, { agent: headers['user-agent'] });
            res.status(200).json({ Message: 'User removed successful' }).end();
        } catch (error) {
            winston.error({ error, message: 'User delete' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }
}

module.exports = new UserController();
