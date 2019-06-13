"use strict";

const router = require('express').Router();
const model = require("../../models/bucket");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");

module.exports = app => {
    const bucket = require("./controllers/bucket.controller")(app);

    router.post(`/`, auth.bucket, validate(model), bucket.save);
    router.get(`/:name`, auth.bucket, bucket.stats);
    router.put(`/:name`, auth.bucket, validate(model), bucket.edit);
    router.delete(`/:name`, auth.bucket, bucket.delete);

    return router;
}