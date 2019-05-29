"use strict";

const router = require('express').Router();

module.exports = app => {
    const login = require("./login")(app);

    router.post(`/`, login.login);
    router.put(`/password`, login.password);

    return router;
}