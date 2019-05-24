"use strict";

const auth = require("../middlewares/auth");

module.exports = app => {
    const object = app.controllers.object;

    app.post(`${app.get("version")}/objects/upload`, auth.object, object.upload);
    app.get(`${app.get("version")}/objects/:name`, auth.object, object.stats);
    app.delete(`${app.get("version")}/objects/:name`, auth.object, object.delete);
}