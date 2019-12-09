const fs = require('fs');

class RootController {
    constructor() {
        this.bucket = this.bucket.bind(this);
        this.folder = this.folder.bind(this);
        this.object = this.object.bind(this);
    }

    async bucket({ headers, params, query, winston }, res) {
        try {
            let data = await fs.readdirSync(`./data/${params.bucket}`);
            if (data) {
                if (query.type) {
                    if (query.type === 'folder') {
                        const folders = [];
                        for (let i = 0; i < data.length; i += 1) {
                            if (data[i].search(new RegExp('[.]')) === -1) {
                                folders.push({ name: data[i], type: 'folder' });
                            }
                        }
                        winston.info({ bucket: params.bucket, message: 'Bucket search' }, { agent: headers['user-agent'] });
                        res.status(200).json(folders).end();
                    } else if (query.type === 'object') {
                        const objects = [];
                        for (let i = 0; i < data.length; i += 1) {
                            if (data[i].search(new RegExp('[.]')) !== -1) {
                                objects.push({ name: data[i], type: 'object' });
                            }
                        }
                        winston.info({ bucket: params.bucket, message: 'Bucket search' }, { agent: headers['user-agent'] });
                        res.status(200).json(objects).end();
                    } else {
                        winston.info({ bucket: params.bucket, message: 'Bucket search' }, { agent: headers['user-agent'] });
                        res.status(200).json([]).end();
                    }
                } else {
                    data = data.map((file) => {
                        if (file.search(new RegExp('[.]')) === -1) {
                            return { name: file, type: 'folder' };
                        }
                        return { name: file, type: 'object' };
                    });
                    winston.info({ bucket: params.bucket, message: 'Bucket search' }, { agent: headers['user-agent'] });
                    res.status(200).json(data).end();
                }
            } else {
                winston.info({ bucket: params.bucket, message: 'Bucket search' }, { agent: headers['user-agent'] });
                res.status(200).json(data).end();
            }
        } catch (error) {
            winston.error({ error, message: 'Bucket search' }, { agent: headers['user-agent'] });
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async folder({ headers, params, folder, winston }, res) {
        if (folder) {
            fs.readdir(`./data/${params.bucket}/${params.param}`, (err, data) => {
                if (err) {
                    winston.info({ bucket: params.bucket, folder: params.param, message: 'Bucket not found (folder list)' }, { agent: headers['user-agent'] });
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                } else {
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i += 1) {
                            data[i] = { name: data[i], type: 'object' };
                        }
                    }
                    winston.info({ bucket: params.bucket, folder: params.param, message: 'Folder list' }, { agent: headers['user-agent'] });
                    res.status(200).json(data).end();
                }
            });
        } else {
            winston.info({ bucket: params.bucket, object: params.param, message: 'Object' }, { agent: headers['user-agent'] });
            const object = fs.createReadStream(`./data/${params.bucket}/${params.param}`);
            object.on('error', () => res.status(404).json({ Message: 'Object not found' }).end());
            object.pipe(res);
        }
    }

    async object({ headers, params, winston }, res) {
        winston.info({
            bucket: params.bucket,
            folder: params.folder,
            object: params.param,
            message: 'Object',
        }, { agent: headers['user-agent'] });
        const object = fs.createReadStream(`./data/${params.bucket}/${params.folder}/${params.object}`);
        object.on('error', () => res.status(404).json({ Message: 'Object not found' }).end());
        object.pipe(res);
    }
}

module.exports = new RootController();
