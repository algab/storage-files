"use strict";

const cp = require("child_process");
const sqlite = require("sqlite3");
const hasha = require("hasha");
const util = require("util");
const fs = require("fs");

if (fs.existsSync("./data") === false) {
    fs.mkdirSync("./data");
}

const db = new sqlite.Database("./data/storage.db");

if (fs.existsSync("./data/storage.db") === false) {
    cp.execSync("sqlite3 data/storage.db < storage.sql");
    const password = hasha(process.env.ADMIN_PASS, { 'algorithm': 'md5' });
    db.run("INSERT INTO managers (name,email,password) VALUES (?,?,?)", ["ADMIN", process.env.ADMIN_EMAIL, password]);
}

const all = util.promisify(db.all).bind(db);
const get = util.promisify(db.get).bind(db);
const run = util.promisify(db.run).bind(db);

module.exports = { all, get, run };