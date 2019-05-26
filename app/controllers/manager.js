"use strict";

const hasha = require("hasha");

class Manager {
    constructor(app) {
        this.db = app.get("database");
        this.save = this.save.bind(this);
        this.list = this.list.bind(this);
        this.search = this.search.bind(this);
        this.edit = this.edit.bind(this);
        this.password = this.password.bind(this);
        this.delete = this.delete.bind(this);
    }

    async save(req, res) {
        try {
            if (req.body.password) {
                req.body.password = hasha(req.body.password, { 'algorithm': 'md5' });
                await this.db.run("INSERT INTO managers (name,email,password) VALUES (?,?,?)", [req.body.name, req.body.email, req.body.password]);
                res.status(201).json(req.body).end();
            }
            else {
                res.status(400).json({ "Message": "Password is required" }).end();
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async list(req, res) {
        try {
            let managers = await this.db.all("SELECT * FROM managers");
            managers = managers.map(data => {
                delete data.password;
                return data;
            });
            res.status(200).json(managers).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async search(req, res) {
        try {
            let id = req.params.id;
            let manager = await this.db.get("SELECT * FROM managers WHERE id = ?", [id]);
            if (manager) {
                delete manager.password;
            }
            res.status(200).json(manager).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async edit(req, res) {
        try {
            let id = req.params.id;
            let manager = await this.db.get("SELECT email FROM managers WHERE id = ?", [id]);
            if (req.body.email == manager.email) {
                await this.db.run("UPDATE managers SET name = ?, email = ? WHERE id = ?", [req.body.name, req.body.email, id]);
                res.status(200).json({ "Message": "Manager updated successful" }).end();
            }
            else {
                let email = await this.db.all("SELECT email FROM managers WHERE email = ?", [req.body.email])
                if (email.length == 0) {
                    await this.db.run("UPDATE managers SET name = ?, email = ? WHERE id = ?", [req.body.name, req.body.email, id]);
                    res.status(200).json({ "Message": "Manager updated successful" }).end();
                }
                else {
                    res.status(409).json({ "Message": "Email already exists" }).end()
                }
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async password(req, res) {
        try {
            let id = req.params.id;
            if (req.body.password) {
                req.body.password = hasha(req.body.password, { 'algorithm': 'md5' });
                await this.db.run("UPDATE managers SET password = ? WHERE id = ?", [req.body.password, id]);
                res.status(200).json({ "Message": "Password changed successful" }).end();
            }
            else {
                res.status(400).json({ "Message": "Password is required" }).end()
            }
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }

    async delete(req, res) {
        try {
            let id = req.params.id;
            await this.db.run("DELETE FROM managers WHERE id = ?", [id]);
            res.status(200).json({ "Message": "Manager removed successful" }).end();
        } catch (error) {
            res.status(500).json({ "Message": "Server Error" }).end();
        }
    }
}

module.exports = app => { return new Manager(app) }