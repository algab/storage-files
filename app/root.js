"use strict";

module.exports = app => {
    const bucket = app.controllers.bucket;

    app.get(`/:name`, bucket.list);
    app.get("/:bucket/:param", (req, res) => {
        let nameBucket = req.params.bucket;
        let param = req.params.param;
        if (res.locals.folder) {
            fs.readdir(`./data/${nameBucket}/${param}`, (err, data) => {
                if (err) {
                    res.status(404).json({ "Message": "Bucket not found" }).end();
                }
                else {
                    if (data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            data[i] = { "name": data[i], "type": "object" }
                        }
                    }
                    res.status(200).json(data).end();
                }
            });
        }
        else {
            const object = fs.createReadStream(`./data/${nameBucket}/${param}`);
            object.on("error", (err) => {
                res.status(404).json({ "Message": "Object not found" })
            });
            object.pipe(res);
        }
    });
    app.get("/:bucket/:folder/:object", (req, res) => {
        let nameBucket = req.params.bucket;
        let nameFolder = req.params.folder;
        let nameObject = req.params.object;
        const object = fs.createReadStream(`./data/${nameBucket}/${nameFolder}/${nameObject}`);
        object.on("error", (err) => {
            res.status(404).json({ "Message": "Object not found" });
        });
        object.pipe(res);
    });
}