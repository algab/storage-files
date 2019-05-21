"use strict";

const fs = require("fs");
const pretty = require("prettysize");
const moment = require("moment-timezone");

class Bucket {
    constructor(app) {
        this.db = app.get("database");
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.stats = this.stats.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.sizeBucket = this.sizeBucket.bind(this);
        this.sizeFolder = this.sizeFolder.bind(this);
        this.generateDate = this.generateDate.bind(this);
        this.generateTime = this.generateTime.bind(this);
    }

    async save(req, res) {
        try {
            let user = await this.db.all("SELECT * FROM users WHERE nick = ?", [req.body.nick]);
            if (user.length != 0) {
                let folder = await this.db.all("SELECT owner FROM buckets WHERE owner = ?", [req.body.nick]);
                if (folder.length == 0) {
                    fs.mkdir(`./data/${req.body.name}`, async (err) => {
                        if (err) {
                            res.status(409).json({ "Message": "Folder already exists" }).end();
                        }
                        else {
                            const date = moment().tz('America/Fortaleza').format();
                            await this.db.run("INSERT INTO buckets (name,date,owner) VALUES (?,?,?)", [req.body.name, date, req.body.nick]);
                            res.status(201).json({ "urlBucket": `${process.env.PROTOCOL}://${req.headers.host}/${req.body.name}`, "date": date }).end();
                        }
                    });
                }
                else {
                    res.status(409).json({ "Message": "User already has a bucket" }).end();
                }
            }
            else {
                res.status(404).json({ "Message": "User not found" }).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async list(req, res) {
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

    async stats(req, res) {
        let name = req.params.name;
        fs.stat(`./data/${name}`, async (err, data) => {
            if (err) {
                res.status(404).json({ "Message": "Bucket not found" }).end();
            }
            else {
                const bucket = await this.db.all("SELECT date FROM buckets WHERE name = ?", [name]);                
                const stats = {
                    "created": {
                        "date": await this.generateDate(bucket[0].date),
                        "time": await this.generateTime(bucket[0].date)
                    },
                    "access": {
                        "date": await this.generateDate(data.atime),
                        "time": await this.generateTime(data.atime)
                    },
                    "modified": {
                        "date": await this.generateDate(data.mtime),
                        "time": await this.generateTime(data.mtime)
                    },
                    "size": pretty(await this.sizeBucket(name))
                }
                res.status(200).json(stats).end();
            }
        });
    }

    async edit(req, res) {
        try {
            let name = req.params.name;
            let user = await this.db.all("SELECT * FROM users WHERE nick = ?", [req.body.nick]);
            if (user.length == 0) {
                res.status(404).json({ "Message": "User not found" }).end();
            }
            else {
                fs.rename(`./data/${name}`, `./data/${req.body.name}`, async (err) => {
                    if (err) {
                        res.status(409).json({ "Message": "Bucket already exists" }).end();
                    }
                    else {
                        await this.db.run("UPDATE buckets SET name = ? WHERE owner = ?", [req.body.name, req.body.nick]);
                        res.status(200).json({ "urlBucket": `${process.env.PROTOCOL}://${req.headers.host}/${req.body.name}` }).end();
                    }
                })
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async delete(req, res) {
        let name = req.params.name
        fs.rmdir(`./data/${name}`, async (err) => {
            if (err) {
                if (err.errno == -2) {
                    res.status(404).json({ "Message": "Bucket not found" }).end();
                }
                if (err.errno == -17 || err.errno == -39) {
                    res.status(409).json({ "Message": "Bucket is not empty" }).end();
                }
            }
            else {
                try {
                    const bucket = await this.db.all("SELECT id FROM buckets WHERE name = ?", [name]);
                    await this.db.run("DELETE FROM buckets WHERE id = ?", [bucket[0].id]);
                    res.status(200).json({ "Message": "Bucket removed successful" }).end();
                } catch (error) {                 
                    fs.mkdirSync(`./data/${name}`);
                    res.status(500).json({ "Message": "Server Error" }).end();
                }
            }
        })
    }

    async sizeBucket(name) {
        let size = 0;
        let data = fs.readdirSync(`./data/${name}`);
        for (let i = 0; i < data.length; i++) {
            if (data[i].search(new RegExp("[.]")) == -1) {
                size += this.sizeFolder(name, data[i]);
            }
            else {
                size += fs.statSync(`./data/${name}/${data[i]}`).size;
            }
        }
        return size;
    }

    async sizeFolder(nameBucket, nameFolder) {
        let size = 0;
        let data = fs.readdirSync(`./data/${nameBucket}/${nameFolder}`);
        for (let i = 0; i < data.length; i++) {
            size += fs.statSync(`./data/${nameBucket}/${nameFolder}/${data[i]}`).size;
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

module.exports = app => { return new Bucket(app) }