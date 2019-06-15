const fs = require('fs');

class Root {
    constructor() {
        this.bucket = this.bucket.bind(this);
        this.folder = this.folder.bind(this);
        this.object = this.object.bind(this);
    }

    async bucket({ params, query }, res) {
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
                        res.status(200).json(folders).end();
                    } else if (query.type === 'object') {
                        const objects = [];
                        for (let i = 0; i < data.length; i += 1) {
                            if (data[i].search(new RegExp('[.]')) !== -1) {
                                objects.push({ name: data[i], type: 'object' });
                            }
                        }
                        res.status(200).json(objects).end();
                    } else {
                        res.status(200).json([]).end();
                    }
                } else {
                    data = data.map((file) => {
                        if (file.search(new RegExp('[.]')) === -1) {
                            return { name: file, type: 'folder' };
                        }
                        return { name: file, type: 'object' };
                    });
                    res.status(200).json(data).end();
                }
            } else {
                res.status(200).json(data).end();
            }
        } catch (error) {
            res.status(500).json({ Message: 'Server Error' }).end();
        }
    }

    async folder({ params }, res) {
        if (res.locals.folder) {
            fs.readdir(`./data/${params.bucket}/${params.param}`, (err, data) => {
                if (err) {
                    res.status(404).json({ Message: 'Bucket not found' }).end();
                } else {
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i += 1) {
                            data[i] = { name: data[i], type: 'object' };
                        }
                    }
                    res.status(200).json(data).end();
                }
            });
        } else {
            const object = fs.createReadStream(`./data/${params.bucket}/${params.param}`);
            object.on('error', () => {
                res.status(404).json({ Message: 'Object not found' }).end();
            });
            object.pipe(res);
        }
    }

    async object({ params }, res) {
        const object = fs.createReadStream(`./data/${params.bucket}/${params.folder}/${params.object}`);
        object.on('error', () => {
            res.status(404).json({ Message: 'Object not found' }).end();
        });
        object.pipe(res);
    }
}

module.exports = new Root();
