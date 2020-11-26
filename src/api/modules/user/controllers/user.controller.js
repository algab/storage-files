const hasha = require('hasha');
const jwt = require('jsonwebtoken');

const { User } = require('../../../../database/models');

class UserController {
  async save({ app, headers, body }, res) {
    try {
      const data = body;
      const countEmail = await User.count({ where: { email: data.email } });
      if (countEmail === 0) {
        const countNick = await User.count({ where: { nick: data.nick } });
        if (countNick === 0) {
          if (data.password) {
            data.password = hasha(data.password, { algorithm: 'md5' });
            const result = await User.create(data);
            app.locals.winston.info(
              { Message: 'User save', user: result },
              { agent: headers['user-agent'] }
            );
            res.status(201).json(data).end();
          } else {
            res.status(400).json({ Message: 'Password is required' }).end();
          }
        } else {
          res.status(409).json({ Message: 'Nick already exists' }).end();
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
      const data = await User.findAll({ attributes: { exclude: ['password'] } });
      res.status(200).json(data).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async search({ params }, res) {
    try {
      const data = await User.findByPk(params.nick, { attributes: { exclude: ['password'] } });
      res.status(200).json(data).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async edit({ app, headers, body, params }, res) {
    try {
      const result = await User.findOne({ where: { nick: params.nick } });
      if (body.email === result.email) {
        delete body.password;
        await User.update(body, { where: { nick: params.nick } });
        app.locals.winston.info(
          { nick: params.nick, message: 'User update' },
          { agent: headers['user-agent'] }
        );
        res.status(200).json({ Message: 'User updated successful' }).end();
      } else {
        const countEmail = await User.count({ where: { email: body.email } });
        if (countEmail === 0) {
          delete body.password;
          await User.update(body, { where: { nick: params.nick } });
          app.locals.winston.info(
            { nick: params.nick, message: 'User update' },
            { agent: headers['user-agent'] }
          );
          res.status(200).json({ Message: 'User updated successful' }).end();
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
        await User.update({ password }, { where: { nick: params.nick } });
        app.locals.winston.info(
          { nick: params.nick, message: 'User password' },
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

  async token({ app, headers, params }, res) {
    try {
      const token = jwt.sign({ nick: params.nick, permission: 'App' }, process.env.JWT_SECRET);
      app.locals.winston.info(
        { nick: params.nick, message: 'User token' },
        { agent: headers['user-agent'] }
      );
      res.status(200).json({ token }).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }

  async delete({ app, headers, params }, res) {
    try {
      await User.destroy({ where: { nick: params.nick } });
      app.locals.winston.info(
        { nick: params.nick, message: 'User delete' },
        { agent: headers['user-agent'] }
      );
      res.status(200).json({ Message: 'User removed successful' }).end();
    } catch (error) {
      res.status(500).json({ Message: 'Server Error' }).end();
    }
  }
}

module.exports = new UserController();
