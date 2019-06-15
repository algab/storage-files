const crypto = require('crypto-js');

const db = require('../../config/database');

class VerifyFolder {
    constructor() {
        this.folder = this.folder.bind(this);
    }

    async folder({ headers, params }, res, next) {
        try {
            if (params.param.search(new RegExp('[.]')) === -1) {
                const nick = await this.decrypt(headers.authorization.slice(7));
                const result = await db.all('SELECT name FROM buckets WHERE owner = ?', [nick]);
                if (result[0].name === params.bucket) {
                    res.locals.folder = true;
                    next();
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

    async decrypt(token) {
        const bytes = crypto.AES.decrypt(token, process.env.TOKEN_SECRET);
        const data = JSON.parse(bytes.toString(crypto.enc.Utf8));
        return data.nick;
    }
}

module.exports = new VerifyFolder();
