var sqlite = require("sqlite3")

const db = new sqlite.Database("./data/storage.db")

module.exports = db
