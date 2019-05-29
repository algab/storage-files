"use strict";

const router = require('express').Router();
const verify = require("../../middlewares/verify");

module.exports = () => {
    const root = require("./root");

    router.get(`/:name`, root.bucket);
    router.get(`/:bucket/:param`, verify.folder, root.folder);
    router.get(`/:bucket/:folder/:object`, root.object);

    return router;
}