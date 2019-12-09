class LoggerController {
    constructor() {
        this.list = this.list.bind(this);
    }

    async list({ query, winston }, res) {
        try {
            winston.query({ level: query.level }, (err, data) => {
                if (err) {
                    res.status(500).json({ Message: 'Server Error' }).end();
                } else if (!err) {
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
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }
}

module.exports = new LoggerController();
