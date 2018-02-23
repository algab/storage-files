var sqlite = require("sqlite3")

const db = new sqlite.Database("storage.db")

module.exports = db
