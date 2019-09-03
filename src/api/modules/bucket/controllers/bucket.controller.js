const pretty = require('prettysize');
const fs = require('fs');

const user = require('../../../models/user.model').dbUser;
const bucket = require('../../../models/bucket.model').dbBucket;

class BucketController {
    constructor(app) {
        this.user = user;
        this.bucket = bucket;
        this.logger = app.get('logger');
        this.save = this.save.bind(this);
        this.stats = this.stats.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save({ headers, body }, res) {
        try {
            const verifyUser = await this.user.count({ where: { nick: body.nick } });
            if (verifyUser !== 0) {
                const result = await this.bucket.count({ where: { user_nick: body.nick } });
                if (result === 0) {
                    fs.mkdir(`./data/${body.name}`, async (err) => {
                        if (err) {
                            res.status(409).json({ Message: 'Bucket already exists' }).end();
                        } else {
                            await this.bucket.create(body);
                            this.logger.info({ data: body, message: 'Bucket save' }, { agent: headers['user-agent'] });
                            res.status(201).json({ urlBucket: `${process.env.HOST}/${body.name}` }).end();
                        }
                    });
                } else {
                    res.status(409).json({ Message: 'User already has a bucket' }).end();
                }
            } else {
                res.status(404).json({ Message: 'User not found' }).end();
            }
        } catch (error) {
            this.logger.error({ error, message: 'Bucket save' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async stats({ params }, res) {
        fs.stat(`./data/${params.name}`, async (err, data) => {
            if (err) {
                res.status(404).json({ Message: 'Bucket not found' }).end();
            } else {
                const result = await this.bucket.findOne({ where: { name: params.name } });
                res.status(200).json({
                    created: result.createdAt,
                    access: data.atime,
                    modified: data.mtime,
                    size: pretty(await this.sizeBucket(params.name)),
                }).end();
            }
        });
    }

    async edit({ headers, body, params }, res) {
        try {
            const verifyUser = await this.user.count({ where: { nick: body.nick } });
            if (verifyUser !== 0) {
                fs.rename(`./data/${params.name}`, `./data/${body.name}`, async (err) => {
                    if (err) {
                        res.status(409).json({ Message: 'Bucket already exists' }).end();
                    } else {
                        await this.bucket.update(body, { where: { user_nick: body.nick } });
                        this.logger.info({ data: body, message: 'Bucket edit' }, { agent: headers['user-agent'] });
                        res.status(200).json({ urlBucket: `${process.env.HOST}/${body.name}` }).end();
                    }
                });
            } else {
                res.status(404).json({ Message: 'User not found' }).end();
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
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                }
                if (err.errno === -17 || err.errno === -39) {
                    res.status(409).json({ Message: 'Bucket is not empty' }).end();
                }
            } else {
                try {
                    await this.bucket.destroy({ where: { name: params.name } });
                    this.logger.info({ bucket: params.name, message: 'Bucket removed' }, { agent: headers['user-agent'] });
                    res.status(200).json({ Message: 'Bucket removed successful' }).end();
                } catch (error) {
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
}

module.exports = app => new BucketController(app);
