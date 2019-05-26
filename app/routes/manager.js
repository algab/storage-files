"use strict";

const router = require('express').Router();
const model = require("../models/manager");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");

module.exports = app => {
    const manager = require("../controllers/manager")(app);

    router.post(`/`, validate(model), manager.save);
    router.get(`/`, manager.list);
    router.get(`/:id`, manager.search);
    router.put(`/:id`, validate(model), manager.edit);
    router.put(`/:id/password`, manager.password);
    router.delete(`/:id`, manager.delete);

    return router;
}