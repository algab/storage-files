"use strict";

module.exports = app => {
    app.use(`${app.get("version")}/buckets`, require("./routes/bucket")(app));
    app.use(`${app.get("version")}/folders`, require("./routes/folder")(app));
    app.use(`${app.get("version")}/login`, require("./routes/login")(app));
    app.use(`${app.get("version")}/managers`, require("./routes/manager")(app));
    app.use(`${app.get("version")}/objects`, require("./routes/object")(app));
    app.use(`${app.get("version")}/users`, require("./routes/user")(app));
    app.use('', require("./routes/root")());
}