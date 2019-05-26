"use strict";

const fs = require("fs");
const pretty = require("prettysize");

class Folder {
    constructor(app) {
        this.db = app.get("database");
        this.save = this.save.bind(this);
        this.stats = this.stats.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        fs.mkdir(`./data/${req.body.bucket}/${req.body.folder}`, (err) => {
            if (err) {
                if (err.errno == -17) {
                    res.status(409).json({ "Message": "Folder with the same name already exists" }).end();
                }
                if (err.errno == -2) {
                    res.status(404).json({ "Message": "Bucket not found" }).end();
                }
            }
            else {
                res.status(201).json({ "urlFolder": `${process.env.HOST}/${req.body.bucket}/${req.body.folder}` }).end();
            }
        });
    }

    async stats(req, res) {
        let nameFolder = req.params.name;
        let nameBucket = req.query.bucket;
        fs.stat(`./data/${nameBucket}/${nameFolder}`, (err, data) => {
            if (err) {
                res.status(404).json({ "Message": "Verify that the bucket name and folder is correct" }).end();
            }
            else {
                res.status(200).json({
                    "created": {
                        "date": generateDate(data.atime),
                        "time": generateTime(data.atime)
                    },
                    "access": {
                        "date": generateDate(data.birthtime),
                        "time": generateTime(data.birthtime)
                    },
                    "modified": {
                        "date": generateDate(data.mtime),
                        "time": generateTime(data.mtime)
                    },
                    "size": pretty(this.sizeFolder(nameBucket, nameFolder))
                }).end();
            }
        })
    }

    async edit(req, res) {
        let name = req.params.name;
        fs.rename(`./data/${req.body.bucket}/${name}`, `./data/${req.body.bucket}/${req.body.folder}`, (err) => {
            if (err) {
                if (err.errno == -17) {
                    res.status(409).json({ "Message": "Folder with the same name already exists" }).end();
                }
                if (err.errno == -2) {
                    res.status(404).json({ "Message": "Bucket not found" }).end();
                }
            }
            else {
                res.status(200).json({ "urlFolder": `${process.env.HOST}/${req.body.bucket}/${req.body.folder}` }).end();
            }
        })
    }

    async delete(req, res) {
        let nameFolder = req.params.name;
        let nameBucket = req.query.bucket;
        fs.rmdir(`./data/${nameBucket}/${nameFolder}`, (err) => {
            if (err) {
                if (err.errno == -17 || err.errno == -39) {
                    res.status(409).json({ "Message": "Folder is not empty" })
                }
                if (err.errno == -2) {
                    res.status(404).json({ "Message": "Bucket not found" })
                }
            }
            else {
                res.status(200).json({ "Message": "Folder removed successful" }).end();
            }
        })
    }

    async sizeFolder(nameBucket, nameFolder) {
        let size = 0;
        let data = fs.readdirSync(`./data/${nameBucket}/${nameFolder}`);
        for (let i = 0; i < data.length; i++) {
            size += fs.statSync(`./data/${nameBucket}/${nameFolder}/${data[i]}`).size
        }
        return size;
    }

    async generateDate(time) {
        let date = new Date(time);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    async generateTime(time) {
        let hour = new Date(time);
        return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`;
    }
}

module.exports = app => { return new Folder(app) }