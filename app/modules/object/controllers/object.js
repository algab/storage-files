"use strict";

const fs = require("fs");
const fsExtra = require("fs-extra");
const formidable = require("formidable");
const pretty = require("prettysize");

class Object {
    constructor(app) {
        this.socket = app.get("socket");
        this.upload = this.upload.bind(this);
        this.stats = this.stats.bind(this);
        this.delete = this.delete.bind(this);
    }

    async upload(req, res) {
        let nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                let nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        const form = new formidable.IncomingForm();
                        form.parse(req, () => { });
                        form.on("progress", (rec, exp) => {
                            let total = (rec / exp) * 100;
                            this.socket.emit(res.locals.nick, { "percent": parseInt(total) });
                        });
                        form.on('file', async (err, file) => {
                            let nameObject = file.name;
                            let object = fs.existsSync(`./data/${nameBucket}/${nameFolder}/${nameObject}`);
                            if (object) {
                                let data = fs.readdirSync(`./data/${nameBucket}/${nameFolder}`);
                                nameObject = await this.nameObject(data, nameObject);
                            }
                            fsExtra.move(file.path, `./data/${nameBucket}/${nameFolder}/${nameObject}`, (err) => {
                                if (err) {
                                    if (err.errno == -17) {
                                        res.status(409).json({ "Message": "Object already exists" }).end();
                                    }
                                    else {
                                        res.status(500).json({ "Message": "Make sure the bucket name is correct and try again" }).end();
                                    }
                                }
                                else {
                                    res.status(200).json({
                                        "Message": "Object saved successful",
                                        "urlObject": `${process.env.HOST}/${nameBucket}/${nameFolder}/${nameObject}`
                                    }).end();
                                }
                            });
                        });
                    }
                    else {
                        res.status(404).json({ "Message": "Folder not found" }).end();
                    }
                }
                else {
                    const form = new formidable.IncomingForm();
                    form.parse(req, () => { });
                    form.on("progress", (rec, exp) => {
                        let total = (rec / exp) * 100;
                        this.socket.emit(res.locals.nick, { "percent": parseInt(total) });
                    });
                    form.on('file', async (err, file) => {
                        let nameObject = file.name;
                        let object = fs.existsSync(`./data/${nameBucket}/${nameObject}`);
                        if (object) {
                            let data = fs.readdirSync(`./data/${nameBucket}`);
                            nameObject = await this.nameObject(data, nameObject);
                        }
                        fsExtra.move(file.path, `./data/${nameBucket}/${nameObject}`, (err) => {
                            if (err) {
                                if (err.errno == -17) {
                                    res.status(409).json({ "Message": "Object already exists" }).end();
                                }
                                else {
                                    res.status(500).json({ "Message": "Make sure the bucket name is correct and try again" }).end();
                                }
                            }
                            else {
                                res.status(200).json({
                                    "Message": "Object saved successful",
                                    "urlObject": `${process.env.HOST}/${nameBucket}/${nameObject}`
                                }).end();
                            }
                        });
                    });
                }
            }
            else {
                res.status(404).json({ "Message": "Bucket not found" }).end();
            }
        }
        else {
            res.status(400).json({ "Message": "Bucket is required" }).end();
        }
    }

    async stats(req, res) {
        let nameObject = req.params.name;
        let nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                let nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        fs.stat(`./data/${nameBucket}/${nameFolder}/${nameObject}`, async (err, data) => {
                            if (err) {
                                res.status(404).json({ "Message": "Make sure the bucket, folder and object is correct and try again" }).end();
                            }
                            else {
                                res.status(200).json({
                                    "created": {
                                        "date": await this.generateDate(data.atime),
                                        "time": await this.generateTime(data.atime)
                                    },
                                    "access": {
                                        "date": await this.generateDate(data.birthtime),
                                        "time": await this.generateTime(data.birthtime)
                                    },
                                    "size": pretty(data.size)
                                }).end();
                            }
                        });
                    }
                    else {
                        res.status(404).json({ "Message": "Folder not found" }).end();
                    }
                }
                else {
                    fs.stat(`./data/${nameBucket}/${nameObject}`, async (err, data) => {
                        if (err) {
                            res.status(404).json({ "Message": "Make sure the bucket and object is correct and try again" }).end();
                        }
                        else {
                            res.status(200).json({
                                "created": {
                                    "date": await this.generateDate(data.atime),
                                    "time": await this.generateTime(data.atime)
                                },
                                "access": {
                                    "date": await this.generateDate(data.birthtime),
                                    "time": await this.generateTime(data.birthtime)
                                },
                                "size": pretty(data.size)
                            }).end();
                        }
                    });
                }
            }
            else {
                res.status(404).json({ "Message": "Bucket not found" }).end();
            }
        }
        else {
            res.status(400).json({ "Message": "Bucket is required" }).end();
        }
    }

    async delete(req, res) {
        let nameObject = req.params.name;
        let nameBucket = req.query.bucket;
        if (nameBucket) {
            if (fs.existsSync(`./data/${nameBucket}`)) {
                let nameFolder = req.query.folder;
                if (nameFolder) {
                    if (fs.existsSync(`./data/${nameBucket}/${nameFolder}`)) {
                        fs.unlink(`./data/${nameBucket}/${nameFolder}/${nameObject}`, (err) => {
                            if (err) {
                                res.status(404).json({ "Message": "Make sure the bucket, folder and object is correct and try again" }).end();
                            }
                            else {
                                res.status(200).json({ "Message": "Object deleted successfully" }).end();
                            }
                        });
                    }
                    else {
                        res.status(404).json({ "Message": "Folder not found" }).end();
                    }
                }
                else {
                    fs.unlink(`./data/${nameBucket}/${nameObject}`, (err) => {
                        if (err) {
                            res.status(404).json({ "Message": "Make sure the bucket and object is correct and try again" }).end();
                        }
                        else {
                            res.status(200).json({ "Message": "Object deleted successfully" }).end();
                        }
                    });
                }
            }
            else {
                res.status(404).json({ "Message": "Bucket not found" }).end();
            }
        }
        else {
            res.status(400).json({ "Message": "Bucket is required" }).end();
        }
    }


    async nameObject(data, nameObject) {
        let total = 0;
        let split = nameObject.split(".");
        if (split.length == 2) {
            for (let i = 0; i < data.length; i++) {
                let hasObject = data[i].search(`${split[0]}-`)
                if (hasObject > -1) {
                    total++
                }
            }
            return `${split[0]}-${total + 1}.${split[1]}`;
        }
        else {
            let newSplit = nameObject.split(".");
            let type = newSplit[newSplit.length - 1];
            newSplit.pop();
            newSplit = newSplit.join(".");
            let split = [];
            split.push(newSplit);
            split.push(type);
            for (let i = 0; i < data.length; i++) {
                let hasObject = data[i].search(`${split[0]}-`)
                if (hasObject > -1) {
                    total++
                }
            }
            return `${split[0]}-${total + 1}.${split[1]}`;
        }
    }

    async generateDate(time) {
        let date = new Date(time)
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }

    async generateTime(time) {
        let hour = new Date(time)
        return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
    }
}

module.exports = app => new Object(app);