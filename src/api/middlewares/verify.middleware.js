const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (req.params.param.search(new RegExp('[.]')) === -1) {
            const token = req.headers.authorization.slice(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.bucket === req.params.bucket) {
                req.folder = true;
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
};
