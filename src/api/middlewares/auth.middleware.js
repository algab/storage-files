const jwt = require('jsonwebtoken');

const bucket = require('../models/bucket.model').dbBucket;

class Auth {
    constructor() {
        this.bucket = bucket;
        this.manager = this.manager.bind(this);
        this.user = this.user.bind(this);
        this.bucketUser = this.bucketUser.bind(this);
        this.verifyBucket = this.verifyBucket.bind(this);
        this.folder = this.folder.bind(this);
        this.object = this.object.bind(this);
    }

    async manager(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.permission === 'Manager') {
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.permission === 'User' || decoded.permission === 'Manager') {
                next();
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async bucketUser(req, res, next) {
        try {
            const token = req.headers.authorization.slice(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (req.params.name === decoded.bucket && decoded.permission === 'User') {
                next();
            } else if (req.body.name === decoded.bucket && decoded.permission === 'User') {
                next();
            } else {
                res.status(401).send('Unauthorized').end();
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end();
        }
    }

    async verifyBucket({ headers, params, query }, res, next) {
        try {
            const result = await this.bucket.findOne({ where: { name: params.bucket } });
            if (result.private) {
                if (headers.authorization) {
                    const token = headers.authorization.slice(7);
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (decoded.permission === 'User') {
                        if (decoded.bucket === params.bucket && decoded.nick === result.user_nick) {
                            next();
                        } else {
                            res.status(401).send('Unauthorized').end();
                        }
                    } else {
                        res.status(401).send('Unauthorized').end();
                    }
                } else if (query.token) {
                    const decoded = jwt.verify(query.token, process.env.JWT_SECRET);
                    if (decoded.permission === 'User') {
                        if (decoded.bucket === params.bucket && decoded.nick === result.user_nick) {
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

    async folder({ headers, body, query }, res, next) {
        try {
            const token = headers.authorization.slice(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (body.bucket && decoded.permission === 'User') {
                const result = await this.bucket.findOne({ where: { name: body.bucket } });
                if (result.name === body.bucket) {
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else if (query.bucket && decoded.permission === 'User') {
                const result = await this.bucket.findOne({ where: { name: query.bucket } });
                if (result.name === query.bucket) {
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

    async object({ headers, query }, res, next) {
        try {
            const token = headers.authorization.slice(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (query.bucket && decoded.permission === 'User') {
                const result = await this.bucket.findOne({ where: { name: query.bucket } });
                if (result.name === query.bucket) {
                    res.locals.nick = decoded.nick;
                    next();
                } else {
                    res.status(401).send('Unauthorized').end();
                }
            } else if (query.bucket && decoded.permission === 'App') {
                const result = await this.bucket.findOne({ where: { name: query.bucket } });
                if (result.name === query.bucket) {
                    res.locals.nick = decoded.nick;
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
}

module.exports = new Auth();
