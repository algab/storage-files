const moment = require('moment-timezone');
const pretty = require('prettysize');
const fs = require('fs');

class Bucket {
    constructor(app) {
        this.db = app.get('database');
        this.logger = app.get('logger');
        this.save = this.save.bind(this);
        this.stats = this.stats.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        try {
            const user = await this.db.all('SELECT * FROM users WHERE nick = ?', [req.body.nick]);
            if (user.length !== 0) {
                const folder = await this.db.all('SELECT owner FROM buckets WHERE owner = ?', [req.body.nick]);
                if (folder.length === 0) {
                    fs.mkdir(`./data/${req.body.name}`, async (err) => {
                        if (err) {
                            this.logger.warn({ nick: req.body.nick, message: 'Bucket already exists (bucket save)' }, { agent: req.headers['user-agent'] });
                            res.status(409).json({ Message: 'Bucket already exists' }).end();
                        } else {
                            const date = moment().tz('America/Fortaleza').format();
                            await this.db.run('INSERT INTO buckets (name,private,date,owner) VALUES (?,?,?,?)', [req.body.name, true, date, req.body.nick]);
                            this.logger.info({ data: req.body, message: 'Bucket save' }, { agent: req.headers['user-agent'] });
                            res.status(201).json({ urlBucket: `${process.env.HOST}/${req.body.name}`, date }).end();
                        }
                    });
                } else {
                    res.status(409).json({ Message: 'User already has a bucket' }).end();
                }
            } else {
                res.status(404).json({ Message: 'User not found' }).end();
            }
        } catch (error) {
            this.logger.error({ error, message: 'Bucket save' }, { agent: req.headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async stats({ headers, params }, res) {
        fs.stat(`./data/${params.name}`, async (err, data) => {
            if (err) {
                this.logger.warn({ bucket: params.name, message: 'Bucket not found (bucket stats)' }, { agent: headers['user-agent'] });
                res.status(404).json({ Message: 'Bucket not found' }).end();
            } else {
                const bucket = await this.db.all('SELECT date FROM buckets WHERE name = ?', [params.name]);
                this.logger.info({ bucket: params.name, message: 'Bucket stats' }, { agent: headers['user-agent'] });
                res.status(200).json({
                    created: {
                        date: this.generateDate(bucket[0].date),
                        time: this.generateTime(bucket[0].date),
                    },
                    access: {
                        date: this.generateDate(data.atime),
                        time: this.generateTime(data.atime),
                    },
                    modified: {
                        date: this.generateDate(data.mtime),
                        time: this.generateTime(data.mtime),
                    },
                    size: pretty(await this.sizeBucket(params.name)),
                }).end();
            }
        });
    }

    async edit({ headers, body, params }, res) {
        try {
            const user = await this.db.all('SELECT * FROM users WHERE nick = ?', [body.nick]);
            if (user.length === 0) {
                res.status(404).json({ Message: 'User not found' }).end();
            } else {
                fs.rename(`./data/${params.name}`, `./data/${body.name}`, async (err) => {
                    if (err) {
                        this.logger.warn({ bucket: body.name, message: 'Bucket already exists (bucket edit)' }, { agent: headers['user-agent'] });
                        res.status(409).json({ Message: 'Bucket already exists' }).end();
                    } else {
                        await this.db.run('UPDATE buckets SET name = ?, private = ? WHERE owner = ?', [body.name, Boolean(body.private), body.nick]);
                        this.logger.info({ data: body, message: 'Bucket edit' }, { agent: headers['user-agent'] });
                        res.status(200).json({ urlBucket: `${process.env.HOST}/${body.name}` }).end();
                    }
                });
            }
        } catch (error) {
            this.logger.error({ error, message: 'Bucket edit' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async delete({ headers, params }, res) {
        fs.rmdir(`./data/${params.name}`, async (err) => {
            if (err) {
                if (err.errno === -2) {
                    this.logger.warn({ bucket: params.name, message: 'Bucket not found (bucket delete)' }, { agent: headers['user-agent'] });
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                }
                if (err.errno === -17 || err.errno === -39) {
                    this.logger.warn({ bucket: params.name, message: 'Bucket is not empty (bucket delete)' }, { agent: headers['user-agent'] });
                    res.status(409).json({ Message: 'Bucket is not empty' }).end();
                }
            } else {
                try {
                    const bucket = await this.db.all('SELECT id FROM buckets WHERE name = ?', [params.name]);
                    await this.db.run('DELETE FROM buckets WHERE id = ?', [bucket[0].id]);
                    this.logger.info({ bucket: params.name, message: 'Bucket removed successful' }, { agent: headers['user-agent'] });
                    res.status(200).json({ Message: 'Bucket removed successful' }).end();
                } catch (error) {
                    fs.mkdirSync(`./data/${params.name}`);
                    this.logger.error({ error, message: 'Bucket delete' }, { agent: headers['user-agent'] });
                    res.status(500).json({ Message: 'Server Error' }).end();
                }
            }
        });
    }

    async sizeBucket(name) {
        const data = fs.readdirSync(`./data/${name}`);
        let size = 0;
        for (let i = 0; i < data.length; i += 1) {
            if (data[i].search(new RegExp('[.]')) === -1) {
                size += this.sizeFolder(name, data[i]);
            } else {
                size += fs.statSync(`./data/${name}/${data[i]}`).size;
            }
        }
        return size;
    }

    sizeFolder(nameBucket, nameFolder) {
        const data = fs.readdirSync(`./data/${nameBucket}/${nameFolder}`);
        let size = 0;
        for (let i = 0; i < data.length; i += 1) {
            size += fs.statSync(`./data/${nameBucket}/${nameFolder}/${data[i]}`).size;
        }
        return size;
    }

    generateDate(time) {
        const date = new Date(time);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    generateTime(time) {
        const hour = new Date(time);
        return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`;
    }
}

module.exports = app => new Bucket(app);
