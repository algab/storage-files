"use strict";

const sqlite = require("sqlite3");
const util = require("util");

const db = new sqlite.Database("./data/storage.db");

const all = util.promisify(db.all).bind(db);
const run = util.promisify(db.run).bind(db);

module.exports = { all, run };