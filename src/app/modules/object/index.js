"use strict";

const router = require('express').Router();
const auth = require("../../middlewares/auth");

module.exports = app => {
    const object = require("./controllers/object.controller")(app);

    router.post(`/upload`, auth.object, object.upload);
    router.get(`/:name`, auth.object, object.stats);
    router.delete(`/:name`, auth.object, object.delete);

    return router;
}