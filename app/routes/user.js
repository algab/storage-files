"use strict";

const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");

module.exports = app => {
    const user = app.controllers.user;
    const model = app.models.user;

    app.post(`${app.get("version")}/users`, validate(model), user.save);
    app.get(`${app.get("version")}/users`, auth.manager, user.list);
    app.get(`${app.get("version")}/users/:nick`, auth.user, user.search);
    app.put(`${app.get("version")}/users/:nick`, auth.user, validate(model), user.edit);
    app.put(`${app.get("version")}/users/:nick/password`, auth.user, user.password);
    app.put(`${app.get("version")}/users/:nick/token`, auth.user, user.token);
    app.delete(`${app.get("version")}/users/:nick`, auth.user, user.delete);
}