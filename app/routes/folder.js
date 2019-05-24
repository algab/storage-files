"use strict";

const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");

module.exports = app => {
    const folder = app.controllers.folder;
    const model = app.models.folder;

    app.post(`${app.get("version")}/folders`, auth.folder, validate(model), folder.save);
    app.get(`${app.get("version")}/folders/:name`, auth.folder, folder.stats);
    app.put(`${app.get("version")}/folders/:name`, auth.folder, validate(model), folder.edit);
    app.delete(`${app.get("version")}/folders/:name`, auth.folder, folder.delete);
}