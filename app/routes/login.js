"use strict";

module.exports = app => {
    const login = app.controllers.login;

    app.post(`${app.get("version")}/login`, login.login);
}