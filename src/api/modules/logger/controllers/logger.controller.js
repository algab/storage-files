class LoggerController {
  async list({ app, query }, res) {
    try {
      app.locals.winston.query({ level: query.level }, (err, data) => {
        if (err) {
          res.status(500).json({ Message: 'Server Error' }).end();
        } else {
          res.status(200).json(data.file).end();
        }
      });
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }
}

module.exports = new LoggerController();
