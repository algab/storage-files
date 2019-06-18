class Logger {
    constructor(app) {
        this.logger = app.get('logger');
        this.list = this.list.bind(this);
    }

    async list({ headers, query }, res) {
        try {
            this.logger.query({ level: query.level }, (err, data) => {
                if (err) {
                    this.logger.error({ error: err, message: 'Logger list' }, { agent: headers['user-agent'] });
                    res.status(500).json({ Message: 'Server Error' }).end();
                } else if (!err) {
                    this.logger.info({ message: 'Logger list' }, { agent: headers['user-agent'] });
                    if (query.message) {
                        const logs = data.file.filter((log) => {
                            if (log.message.message === query.message) {
                                return log;
                            }
                            return null;
                        });
                        res.status(200).json(logs).end();
                    } else {
                        res.status(200).json(data.file).end();
                    }
                }
            });
        } catch (error) {
            this.logger.error({ error, message: 'Logger list' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }
}

module.exports = app => new Logger(app);
