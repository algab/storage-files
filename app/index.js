"use strict";

module.exports = app => {
    app.use(`${app.get("version")}/buckets`, require("./modules/bucket")(app));
    app.use(`${app.get("version")}/folders`, require("./modules/folder")(app));
    app.use(`${app.get("version")}/login`, require("./modules/login")(app));
    app.use(`${app.get("version")}/managers`, require("./modules/manager")(app));
    app.use(`${app.get("version")}/objects`, require("./modules/object")(app));
    app.use(`${app.get("version")}/users`, require("./modules/user")(app));
    app.use('', require("./modules/root")());
}