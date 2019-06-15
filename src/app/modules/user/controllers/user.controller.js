const moment = require('moment-timezone');
const crypto = require('crypto-js');
const hasha = require('hasha');

class User {
    constructor(app) {
        this.db = app.get('database');
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.token = this.token.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save({ body }, res) {
        try {
            const data = body;
            const result = await this.verifyEmail(data.email);
            if (result) {
                const nick = await this.db.all('SELECT nick FROM users WHERE nick = ?', [data.nick]);
                if (nick.length !== 0) {
                    res.status(409).json({ Message: 'Nick already exists' }).end();
                } else {
                    if (data.password) {
                        data.password = hasha(data.password, { algorithm: 'md5' });
                        data.date = moment().tz('America/Fortaleza').format();
                        await this.db.run('INSERT INTO users (nick,name,country,state,city,email,password,date) VALUES (?,?,?,?,?,?,?,?)', [data.nick, data.name, data.country, data.state, data.city, data.email, data.password, data.date]);
                        res.status(201).json(data).end();
                    }
                    res.status(400).json({ Message: 'Password is required' }).end();
                }
            } else {
                res.status(409).json({ Message: 'Email conflict' }).end();
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async list(req, res) {
        try {
            let users = await this.db.all('SELECT * FROM users');
            users = users.map((data) => {
                delete data.password;
                return data;
            });
            res.status(200).json(users).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async search({ params }, res) {
        try {
            const user = await this.db.get('SELECT * FROM users WHERE nick = ?', [params.nick]);
            if (user) {
                delete user.password;
            }
            res.status(200).json(user).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async edit({ body, params }, res) {
        try {
            const data = body;
            const user = await this.db.all('SELECT email FROM users WHERE nick = ?', [params.nick]);
            if (data.email === user[0].email) {
                await this.db.run('UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ? WHERE nick = ?', [data.name, data.country, data.state, data.city, data.email, data.nick]);
                res.status(200).json({ Message: 'User updated successful' }).end();
            } else {
                const verify = await this.verifyEmail(data.email);
                if (verify) {
                    await this.db.run('UPDATE users SET name = ?, country = ?, state = ?, city = ?, email = ? WHERE nick = ?', [data.name, data.country, data.state, data.city, data.email, data.nick]);
                    res.status(200).json({ Message: 'User updated successful' }).end();
                } else {
                    res.status(409).json({ Message: 'Email already exists' }).end();
                }
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async password({ body, params }, res) {
        try {
            const data = body;
            if (data.password) {
                data.password = hasha(data.password, { algorithm: 'md5' });
                await this.db.run('UPDATE users SET password = ? WHERE nick = ?', [data.password, params.nick]);
                res.status(200).json({ Message: 'Password changed successful' }).end();
            } else {
                res.status(400).json({ Message: 'Password is required' }).end();
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async token({ params }, res) {
        try {
            const encrypt = crypto.AES.encrypt(JSON.stringify({ nick: params.nick, type: 'app', date: moment().tz('America/Fortaleza').format() }), process.env.TOKEN_SECRET);
            res.status(200).json({ token: `Bearer ${encrypt.toString()}` }).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async delete({ params }, res) {
        try {
            await this.db.run('DELETE FROM users WHERE nick = ?', [params.nick]);
            res.status(200).json({ Message: 'User removed successful' }).end();
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async verifyEmail(email) {
        try {
            const user = await this.db.all('SELECT email FROM users WHERE email = ?', [email]);
            if (user.length === 0) {
                const manager = await this.db.all('SELECT email FROM managers WHERE email = ?', [email]);
                if (manager.length === 0) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}

module.exports = app => new User(app);
