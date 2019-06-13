"use strict";

const router = require('express').Router();
const auth = require("../../middlewares/auth");
const verify = require("../../middlewares/verify");

module.exports = () => {
    const root = require("./controllers/root.controller");

    router.get(`/:bucket`, auth.verifyBucket, root.bucket);
    router.get(`/:bucket/:param`, auth.verifyBucket, verify.folder, root.folder);
    router.get(`/:bucket/:folder/:object`, auth.verifyBucket, root.object);

    return router;
}