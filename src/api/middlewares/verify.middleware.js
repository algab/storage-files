const jwt = require('jsonwebtoken');

class VerifyFolder {
    constructor() {
        this.folder = this.folder.bind(this);
    }

    async folder({ headers, params }, res, next) {
        try {
            if (params.param.search(new RegExp('[.]')) === -1) {
                const token = headers.authorization.slice(7);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.bucket === params.bucket) {
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
}

module.exports = new VerifyFolder();
