"use strict";

const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");

module.exports = app => {
    const bucket = app.controllers.bucket;
    const model = app.models.bucket;

    app.post(`${app.get("version")}/buckets`, auth.bucket, validate(model), bucket.save);
    app.get(`${app.get("version")}/buckets/:name`, auth.bucket, bucket.stats);
    app.put(`${app.get("version")}/buckets/:name`, auth.bucket, validate(model), bucket.edit);
    app.delete(`${app.get("version")}/buckets/:name`, auth.bucket, bucket.delete);
}