const moment = require('moment');
const crypto = require('crypto-js');

const db = require('../../config/database');

class Auth {
    constructor() {
        this.manager = this.manager.bind(this);
        this.user = this.user.bind(this);
        this.bucket = this.bucket.bind(this);
        this.verifyBucket = this.verifyBucket.bind(this);
        this.folder = this.folder.bind(this);
        this.object = this.object.bind(this);
    }

    async manager(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
            const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
            if (await this.validate(data.date) && data.type === 'manager') {
                next();
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async user(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
            const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
            if (await this.validate(data.date) && (data.type === 'user' || data.type === 'manager')) {
                next();
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async bucket(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
            const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
            if (req.params.name && await this.validate(data.date) && data.type === 'user') {
                const bucket = await db.all('SELECT name FROM buckets WHERE owner = ?', [data.nick]);
                if (bucket[0].name === req.params.name) {
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else if (req.body.name && await this.validate(data.date) && data.type === 'user') {
                next();
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async verifyBucket(req, res, next) {
        try {
            const bucket = await db.get('SELECT * FROM buckets WHERE name = ?', [req.params.bucket]);
            if (bucket.private) {
                if (req.headers.authorization) {
                    const token = req.headers.authorization.slice(7);
                    const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
                    const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
                    if (await this.validate(data.date) && data.type === 'user') {
                        if (bucket.name === req.params.bucket && bucket.owner === data.nick) {
                            next();
                        } else {
                            res.status(401).send('Unauthorized').end();
                        }
                    } else {
                        res.status(401).send('Unauthorized').end();
                    }
                } else if (req.query.token) {
                    let token = req.query.token.split(' ')[0];
                    for (let i = 1; i < req.query.token.split(' ').length; i += 1) {
                        token = token.concat(`+${req.query.token.split(' ')[i]}`);
                    }
                    const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
                    const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
                    if (await this.validate(data.date) && data.type === 'user') {
                        if (bucket.name === req.params.bucket && bucket.owner === data.nick) {
                            next();
                        } else {
                            res.status(401).send('Unauthorized').end();
                        }
                    } else {
                        res.status(401).send('Unauthorized').end();
                    }
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else {
                next();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async folder(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
            const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
            if (req.body.bucket && await this.validate(data.date) && data.type === 'user') {
                const bucket = await db.all('SELECT name FROM buckets WHERE owner = ?', [data.nick]);
                if (bucket[0].name === req.body.bucket) {
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else if (req.query.bucket && await this.validate(data.date) && data.type === 'user') {
                const bucket = await db.all('SELECT name FROM buckets WHERE owner = ?', [data.nick]);
                if (bucket[0].name === req.query.bucket) {
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async object(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
            const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
            if (req.query.bucket && await this.validate(data.date) && data.type === 'user') {
                const bucket = await db.all('SELECT name FROM buckets WHERE owner = ?', [data.nick]);
                if (bucket[0].name === req.query.bucket) {
                    res.locals.nick = data.nick;
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else if (req.query.bucket && data.type === 'app') {
                const bucket = await db.all('SELECT name FROM buckets WHERE owner = ?', [data.nick]);
                if (bucket[0].name === req.query.bucket) {
                    res.locals.nick = data.nick;
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async validate(date) {
        const tokenDate = moment(date).add(parseFloat(process.env.TOKEN_EXP), 'hour').format();
        const result = moment(tokenDate).startOf('hour').fromNow().toString();
        if (result.search('ago') !== -1) {
            return false;
        }
        return true;
    }
}

module.exports = new Auth();
