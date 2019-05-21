"use strict";

module.exports = app => {
    const user = app.controllers.user;
    const model = app.models.user;

    app.post(`${app.get("version")}/users`,user.save);
    app.get(`${app.get("version")}/users`,user.list);
    app.get(`${app.get("version")}/users/:nick`,user.search);
    app.put(`${app.get("version")}/users/:nick`,user.edit);
    app.put(`${app.get("version")}/users/:nick/password`,user.password);
    app.delete(`${app.get("version")}/users/:nick`,user.delete);
}