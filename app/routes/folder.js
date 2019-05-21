"use strict";

module.exports = app => {
    const folder = app.controllers.folder;
    const moel = app.models.folder;

    app.post(`${app.get("version")}/folders`,folder.save);
    app.get(`${app.get("version")}/folders/:name`,folder.stats);
    app.put(`${app.get("version")}/folders/:name`,folder.edit);
    app.delete(`${app.get("version")}/folders/:name`,folder.delete);
}