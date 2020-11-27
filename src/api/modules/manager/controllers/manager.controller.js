const hasha = require('hasha');

const { Manager } = require('../../../../database/models');

class ManagerController {
  constructor() {
    this.save = this.save.bind(this);
    this.list = this.list.bind(this);
    this.search = this.search.bind(this);
    this.edit = this.edit.bind(this);
    this.password = this.password.bind(this);
    this.delete = this.delete.bind(this);
  }

  async save(req, res) {
    try {
      const data = req.body;
      const countEmail = await Manager.count({ where: { email: data.email } });
      if (countEmail === 0) {
        if (data.password) {
          data.password = hasha(data.password, { algorithm: 'md5' });
          await Manager.create(data);
          res.status(201).json(data).end();
        } else {
          res.status(400).json({ Message: 'Password is required' }).end();
        }
      } else {
        res.status(409).json({ Message: 'Email conflict' }).end();
      }
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async list(req, res) {
    try {
      const data = await Manager.findAll({ attributes: { exclude: ['password'] } });
      res.status(200).json(data).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async search({ params }, res) {
    try {
      const data = await Manager.findByPk(params.id, {
        attributes: { exclude: ['password'] },
      });
      res.status(200).json(data).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async edit({ app, headers, body, params }, res) {
    try {
      const result = await this.user.findOne({ where: { id: params.id } });
      if (body.email === result.email) {
        delete body.password;
        await Manager.update(body, { where: { id: params.id } });
        app.locals.winston.info(
          { id: params.id, message: 'Manager updated' },
          { agent: headers['user-agent'] }
        );
        res.status(200).json({ Message: 'Manager updated successful' }).end();
      } else {
        const countEmail = await Manager.count({ where: { email: body.email } });
        if (countEmail === 0) {
          delete body.password;
          await Manager.update(body, { where: { id: params.id } });
          app.locals.winston.info(
            { id: params.id, message: 'Manager updated' },
            { agent: headers['user-agent'] }
          );
          res.status(200).json({ Message: 'Manager updated successful' }).end();
        } else {
          res.status(409).json({ Message: 'Email already exists' }).end();
        }
      }
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async password({ app, headers, body, params }, res) {
    try {
      if (body.password) {
        const password = hasha(body.password, { algorithm: 'md5' });
        await Manager.update({ password }, { where: { nick: params.nick } });
        app.locals.winston.info(
          { nick: params.nick, message: 'Manager password' },
          { agent: headers['user-agent'] }
        );
        res.status(200).json({ Message: 'Password changed successful' }).end();
      } else {
        res.status(400).json({ Message: 'Password is required' }).end();
      }
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async delete({ app, headers, params }, res) {
    try {
      await this.user.destroy({ where: { nick: params.nick } });
      app.locals.winston.info(
        { nick: params.nick, message: 'Manager delete' },
        { agent: headers['user-agent'] }
      );
      res.status(200).json({ Message: 'Manager removed successful' }).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }
}

module.exports = new ManagerController();
