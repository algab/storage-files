const formidable = require('formidable');
const pretty = require('prettysize');
const fsExtra = require('fs-extra');
const fs = require('fs');

class ObjectController {
    constructor(app) {
        this.socket = app.get('socket');
        this.logger = app.get('logger');
        this.upload = this.upload.bind(this);
        this.stats = this.stats.bind(this);
        this.delete = this.delete.bind(this);
    }

    async upload(req, res) {
        const nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                const nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        const form = new formidable.IncomingForm();
                        form.parse(req, () => { });
                        form.on('progress', (rec, exp) => {
                            const percent = (rec / exp) * 100;
                            this.socket.emit(res.locals.nick, { percent: parseInt(percent, 10) });
                        });
                        form.on('file', async (_, file) => {
                            let nameObject = await this.prepareName(file.name);
                            const object = fs.existsSync(`./data/${nameBucket}/${nameFolder}/${nameObject}`);
                            if (object) {
                                const data = fs.readdirSync(`./data/${nameBucket}/${nameFolder}`);
                                nameObject = await this.makeNameObject(data, nameObject);
                            }
                            fsExtra.move(file.path, `./data/${nameBucket}/${nameFolder}/${nameObject}`, (err) => {
                                if (err) {
                                    if (err.errno === -17) {
                                        this.logger.error({ nick: res.locals.nick, object: nameObject, message: 'Object already exists' }, { agent: req.headers['user-agent'] });
                                        res.status(409).json({ Message: 'Object already exists' }).end();
                                    } else {
                                        this.logger.error(
                                            {
                                                nick: res.locals.nick, bucket: nameBucket, folder: nameFolder, message: 'Make sure the bucket name is correct and try again',
                                            },
                                            {
                                                agent: req.headers['user-agent'],
                                            },
                                        );
                                        res.status(500).json({ Message: 'Make sure the bucket and folder name is correct and try again' }).end();
                                    }
                                } else {
                                    this.logger.info(
                                        {
                                            nick: res.locals.nick, bucket: nameBucket, folder: nameFolder, object: nameObject, message: 'Object saved successful',
                                        },
                                        {
                                            agent: req.headers['user-agent'],
                                        },
                                    );
                                    res.status(200).json({
                                        Message: 'Object saved successful',
                                        urlObject: `${process.env.HOST}/${nameBucket}/${nameFolder}/${nameObject}`,
                                    }).end();
                                }
                            });
                        });
                    } else {
                        res.status(404).json({ Message: 'Folder not found' }).end();
                    }
                } else {
                    const form = new formidable.IncomingForm();
                    form.parse(req, () => { });
                    form.on('progress', (rec, exp) => {
                        const percent = (rec / exp) * 100;
                        this.socket.emit(res.locals.nick, { percent: parseInt(percent, 10) });
                    });
                    form.on('file', async (_, file) => {
                        let nameObject = await this.prepareName(file.name);
                        const object = fs.existsSync(`./data/${nameBucket}/${nameObject}`);
                        if (object) {
                            const data = fs.readdirSync(`./data/${nameBucket}`);
                            nameObject = await this.makeNameObject(data, nameObject);
                        }
                        fsExtra.move(file.path, `./data/${nameBucket}/${nameObject}`, (err) => {
                            if (err) {
                                if (err.errno === -17) {
                                    this.logger.error({ nick: res.locals.nick, object: nameObject, message: 'Object already exists' }, { agent: req.headers['user-agent'] });
                                    res.status(409).json({ Message: 'Object already exists' }).end();
                                } else {
                                    this.logger.error({ nick: res.locals.nick, bucket: nameBucket, message: 'Make sure the bucket name is correct and try again' }, { agent: req.headers['user-agent'] });
                                    res.status(500).json({ Message: 'Make sure the bucket name is correct and try again' }).end();
                                }
                            } else {
                                this.logger.info(
                                    {
                                        nick: res.locals.nick, bucket: nameBucket, object: nameObject, message: 'Object saved successful',
                                    },
                                    {
                                        agent: req.headers['user-agent'],
                                    },
                                );
                                res.status(200).json({
                                    Message: 'Object saved successful',
                                    urlObject: `${process.env.HOST}/${nameBucket}/${nameObject}`,
                                }).end();
                            }
                        });
                    });
                }
            } else {
                res.status(404).json({ Message: 'Bucket not found' }).end();
            }
        } else {
            res.status(400).json({ Message: 'Bucket is required' }).end();
        }
    }

    async stats(req, res) {
        const nameObject = req.params.name;
        const nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                const nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        fs.stat(`./data/${nameBucket}/${nameFolder}/${nameObject}`, (err, data) => {
                            if (err) {
                                res.status(404).json({ Message: 'Make sure the bucket, folder and object is correct and try again' }).end();
                            } else {
                                this.logger.info(
                                    {
                                        nick: res.locals.nick, bucket: nameBucket, folder: nameFolder, object: nameObject, message: 'Object stats',
                                    },
                                    {
                                        agent: req.headers['user-agent'],
                                    },
                                );
                                res.status(200).json({
                                    created: {
                                        date: this.generateDate(data.atime),
                                        time: this.generateTime(data.atime),
                                    },
                                    access: {
                                        date: this.generateDate(data.birthtime),
                                        time: this.generateTime(data.birthtime),
                                    },
                                    size: pretty(data.size),
                                }).end();
                            }
                        });
                    } else {
                        res.status(404).json({ Message: 'Folder not found' }).end();
                    }
                } else {
                    fs.stat(`./data/${nameBucket}/${nameObject}`, (err, data) => {
                        if (err) {
                            res.status(404).json({ Message: 'Make sure the bucket and object is correct and try again' }).end();
                        } else {
                            this.logger.info(
                                {
                                    nick: res.locals.nick, bucket: nameBucket, object: nameObject, message: 'Object stats',
                                },
                                {
                                    agent: req.headers['user-agent'],
                                },
                            );
                            res.status(200).json({
                                created: {
                                    date: this.generateDate(data.atime),
                                    time: this.generateTime(data.atime),
                                },
                                access: {
                                    date: this.generateDate(data.birthtime),
                                    time: this.generateTime(data.birthtime),
                                },
                                size: pretty(data.size),
                            }).end();
                        }
                    });
                }
            } else {
                res.status(404).json({ Message: 'Bucket not found' }).end();
            }
        } else {
            res.status(400).json({ Message: 'Bucket is required' }).end();
        }
    }

    async delete(req, res) {
        const nameObject = req.params.name;
        const nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                const nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        fs.unlink(`./data/${nameBucket}/${nameFolder}/${nameObject}`, (err) => {
                            if (err) {
                                res.status(404).json({ Message: 'Make sure the bucket, folder and object is correct and try again' }).end();
                            } else {
                                this.logger.info(
                                    {
                                        nick: res.locals.nick, bucket: nameBucket, folder: nameFolder, object: nameObject, message: 'Object delete',
                                    },
                                    {
                                        agent: req.headers['user-agent'],
                                    },
                                );
                                res.status(200).json({ Message: 'Object deleted successfully' }).end();
                            }
                        });
                    } else {
                        res.status(404).json({ Message: 'Folder not found' }).end();
                    }
                } else {
                    fs.unlink(`./data/${nameBucket}/${nameObject}`, (err) => {
                        if (err) {
                            res.status(404).json({ Message: 'Make sure the bucket and object is correct and try again' }).end();
                        } else {
                            this.logger.info(
                                {
                                    nick: res.locals.nick, bucket: nameBucket, object: nameObject, message: 'Object delete',
                                },
                                {
                                    agent: req.headers['user-agent'],
                                },
                            );
                            res.status(200).json({ Message: 'Object deleted successfully' }).end();
                        }
                    });
                }
            } else {
                res.status(404).json({ Message: 'Bucket not found' }).end();
            }
        } else {
            res.status(400).json({ Message: 'Bucket is required' }).end();
        }
    }

    async prepareName(name) {
        if (name.search('#') !== -1) {
            let nameObject = name.split('#')[0];
            for (let i = 1; i < name.split('#').length; i += 1) {
                nameObject = nameObject.concat(` ${name.split('#')[i]}`);
            }
            return nameObject;
        }
        return name;
    }


    async makeNameObject(data, nameObject) {
        const split = nameObject.split('.');
        let total = 0;
        if (split.length === 2) {
            for (let i = 0; i < data.length; i += 1) {
                const hasObject = data[i].search(`${split[0]}-`);
                if (hasObject > -1) {
                    total += 1;
                }
            }
            return `${split[0]}-${total + 1}.${split[1]}`;
        }
        let newSplit = nameObject.split('.');
        const type = newSplit[newSplit.length - 1];
        newSplit.pop();
        newSplit = newSplit.join('.');
        split.push(newSplit);
        split.push(type);
        for (let i = 0; i < data.length; i += 1) {
            const hasObject = data[i].search(`${split[0]}-`);
            if (hasObject > -1) {
                total += 1;
            }
        }
        return `${split[0]}-${total + 1}.${split[1]}`;
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

module.exports = app => new ObjectController(app);
