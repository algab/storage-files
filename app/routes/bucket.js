"use strict";

module.exports = app => {
    const bucket = app.controllers.bucket;
    const model = app.models.bucket;
    
    app.post(`${app.get("version")}/buckets`,bucket.save);
    app.get(`/:name`,bucket.list);
    app.get(`${app.get("version")}/buckets/:name`,bucket.stats);
    app.put(`${app.get("version")}/buckets/:name`,bucket.edit);
    app.delete(`${app.get("version")}/buckets/:name`,bucket.delete);
}