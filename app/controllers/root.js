"use strict";

const fs = require("fs");

class Root {
    constructor() {
        this.bucket = this.bucket.bind(this);
        this.folder = this.folder.bind(this);
        this.object = this.object.bind(this);
    }

    async bucket(req, res) {
        try {
            let name = req.params.name;
            let type = req.query.type;
            let data = await fs.readdirSync(`./data/${name}`);
            if (data) {
                if (type) {
                    if (type === "folder") {
                        let folders = []
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].search(new RegExp("[.]")) == -1) {
                                folders.push({ "name": data[i], "type": "folder" });
                            }
                        }
                        res.status(200).json(folders).end();
                    }
                    else if (type === "object") {
                        let objects = [];
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].search(new RegExp("[.]")) != -1) {
                                objects.push({ "name": data[i], "type": "object" });
                            }
                        }
                        res.status(200).json(objects).end();
                    }
                    else {
                        res.status(200).json([]).end();
                    }
                }
                else {
                    data = data.map(data => {
                        if (data.search(new RegExp("[.]")) == -1) {
                            return { "name": data, "type": "folder" }
                        }
                        else {
                            return { "name": data, "type": "object" }
                        }
                    });
                    res.status(200).json(data).end();
                }
            }
            else {
                res.status(200).json(data).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async folder(req, res) {
        let nameBucket = req.params.bucket;
        let param = req.params.param;
        if (res.locals.folder) {
            fs.readdir(`./data/${nameBucket}/${param}`, (err, data) => {
                if (err) {
                    res.status(404).json({ "Message": "Bucket not found" }).end();
                }
                else {
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            data[i] = { "name": data[i], "type": "object" }
                        }
                    }
                    res.status(200).json(data).end();
                }
            });
        }
        else {
            const object = fs.createReadStream(`./data/${nameBucket}/${param}`);
            object.on("error", (err) => {
                res.status(404).json({ "Message": "Object not found" })
            });
            object.pipe(res);
        }
    }

    async object(req, res) {
        let nameBucket = req.params.bucket;
        let nameFolder = req.params.folder;
        let nameObject = req.params.object;
        const object = fs.createReadStream(`./data/${nameBucket}/${nameFolder}/${nameObject}`);
        object.on("error", (err) => {
            res.status(404).json({ "Message": "Object not found" });
        });
        object.pipe(res);
    }
}

module.exports = new Root();