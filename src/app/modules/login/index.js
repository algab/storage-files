"use strict";

const router = require('express').Router();

module.exports = app => {
    const login = require("./controllers/login.controller")(app);

    router.post(`/`, login.login);
    router.put(`/password`, login.password);

    return router;
}