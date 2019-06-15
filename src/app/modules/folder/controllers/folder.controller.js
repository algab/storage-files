const pretty = require('prettysize');
const fs = require('fs');

class Folder {
    constructor(app) {
        this.db = app.get('database');
        this.save = this.save.bind(this);
        this.stats = this.stats.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        fs.mkdir(`./data/${req.body.bucket}/${req.body.folder}`, (err) => {
            if (err) {
                if (err.errno === -17) {
                    res.status(409).json({ Message: 'Folder with the same name already exists' }).end();
                }
                if (err.errno === -2) {
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                }
            } else {
                res.status(201).json({ urlFolder: `${process.env.HOST}/${req.body.bucket}/${req.body.folder}` }).end();
            }
        });
    }

    async stats({ params, query }, res) {
        fs.stat(`./data/${query.bucket}/${params.name}`, async (err, data) => {
            if (err) {
                res.status(404).json({ Message: 'Verify that the bucket name and folder is correct' }).end();
            } else {
                res.status(200).json({
                    created: {
                        date: this.generateDate(data.atime),
                        time: this.generateTime(data.atime),
                    },
                    access: {
                        date: this.generateDate(data.birthtime),
                        time: this.generateTime(data.birthtime),
                    },
                    modified: {
                        date: this.generateDate(data.mtime),
                        time: this.generateTime(data.mtime),
                    },
                    size: pretty(await this.sizeFolder(query.bucket, params.name)),
                }).end();
            }
        });
    }

    async edit({ body, params }, res) {
        fs.rename(`./data/${body.bucket}/${params.name}`, `./data/${body.bucket}/${body.folder}`, (err) => {
            if (err) {
                if (err.errno === -17) {
                    res.status(409).json({ Message: 'Folder with the same name already exists' }).end();
                }
                if (err.errno === -2) {
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                }
            } else {
                res.status(200).json({ urlFolder: `${process.env.HOST}/${body.bucket}/${body.folder}` }).end();
            }
        });
    }

    async delete({ params, query }, res) {
        fs.rmdir(`./data/${query.bucket}/${params.name}`, (err) => {
            if (err) {
                if (err.errno === -17 || err.errno === -39) {
                    res.status(409).json({ Message: 'Folder is not empty' });
                }
                if (err.errno === -2) {
                    res.status(404).json({ Message: 'Bucket not found' });
                }
            } else {
                res.status(200).json({ Message: 'Folder removed successful' }).end();
            }
        });
    }

    async sizeFolder(nameBucket, nameFolder) {
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

module.exports = app => new Folder(app);
