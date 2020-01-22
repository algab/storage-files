class LoggerController {
    constructor() {
        this.list = this.list.bind(this);
    }

    async list({ app, query }, res) {
        try {
            app.locals.winston.query({ level: query.level }, (err, data) => {
                if (err) {
                    res.status(500).json({ Message: 'Server Error' }).end();
                } else if (!err) {
                    if (query.message) {
                        const logs = data.file.filter(log => log.message.message === query.message);
                        res.status(200).json(logs).end();
                    } else {
                        res.status(200).json(data.file).end();
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }
}

module.exports = new LoggerController();
