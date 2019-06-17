const hasha = require('hasha');

class Manager {
    constructor(app) {
        this.db = app.get('database');
        this.logger = app.get('logger');
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        try {
            const result = await this.verifyEmail(req.body.email);
            if (result) {
                if (req.body.password) {
                    req.body.password = hasha(req.body.password, { algorithm: 'md5' });
                    await this.db.run('INSERT INTO managers (name,email,password) VALUES (?,?,?)', [req.body.name, req.body.email, req.body.password]);
                    this.logger.info({ data: req.body, message: 'Manager save' }, { agent: req.headers['user-agent'] });
                    res.status(201).json(req.body).end();
                } else {
                    res.status(400).json({ Message: 'Password is required' }).end();
                }
            } else {
                res.status(409).json({ Message: 'Email conflict' }).end();
            }
        } catch (error) {
            this.logger.error({ error, message: 'Manager save' }, { agent: req.headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async list(req, res) {
        try {
            let managers = await this.db.all('SELECT * FROM managers');
            managers = managers.map((data) => {
                delete data.password;
                return data;
            });
            this.logger.info({ message: 'Manager list' }, { agent: req.headers['user-agent'] });
            res.status(200).json(managers).end();
        } catch (error) {
            this.logger.error({ error, message: 'Manager list' }, { agent: req.headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async search({ headers, params }, res) {
        try {
            const manager = await this.db.get('SELECT * FROM managers WHERE id = ?', [params.id]);
            if (manager) {
                delete manager.password;
            }
            this.logger.info({ id: params.id, message: 'Manager search' }, { agent: headers['user-agent'] });
            res.status(200).json(manager).end();
        } catch (error) {
            this.logger.error({ error, message: 'Manager search' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async edit({ headers, body, params }, res) {
        try {
            const manager = await this.db.get('SELECT email FROM managers WHERE id = ?', [params.id]);
            if (body.email === manager.email) {
                await this.db.run('UPDATE managers SET name = ?, email = ? WHERE id = ?', [body.name, body.email, params.id]);
                this.logger.info({ id: params.id, message: 'Manager updated successful' }, { agent: headers['user-agent'] });
                res.status(200).json({ Message: 'Manager updated successful' }).end();
            } else {
                const result = await this.verifyEmail(body.email);
                if (result) {
                    await this.db.run('UPDATE managers SET name = ?, email = ? WHERE id = ?', [body.name, body.email, params.id]);
                    this.logger.info({ id: params.id, message: 'Manager updated successful' }, { agent: headers['user-agent'] });
                    res.status(200).json({ Message: 'Manager updated successful' }).end();
                } else {
                    res.status(409).json({ Message: 'Email already exists' }).end();
                }
            }
        } catch (error) {
            this.logger.error({ error, message: 'Manager edit' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async password({ headers, body, params }, res) {
        try {
            const data = body;
            if (data.password) {
                data.password = hasha(data.password, { algorithm: 'md5' });
                await this.db.run('UPDATE managers SET password = ? WHERE id = ?', [data.password, params.id]);
                this.logger.info({ id: params.id, message: 'Manager password changed successful' }, { agent: headers['user-agent'] });
                res.status(200).json({ Message: 'Password changed successful' }).end();
            } else {
                res.status(400).json({ Message: 'Password is required' }).end();
            }
        } catch (error) {
            this.logger.error({ error, message: 'Manager password' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async delete({ headers, params }, res) {
        try {
            await this.db.run('DELETE FROM managers WHERE id = ?', [params.id]);
            this.logger.info({ id: params.id, message: 'Manager removed successful' }, { agent: headers['user-agent'] });
            res.status(200).json({ Message: 'Manager removed successful' }).end();
        } catch (error) {
            this.logger.error({ error, message: 'Manager delete' }, { agent: headers['user-agent'] });
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

module.exports = app => new Manager(app);
