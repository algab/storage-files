module.exports = (app) => {
    var db = app.get("database")

    var login = {}

    login.user = (req, res) => {
        let data = req.body
        if (data.email && data.password) {
            db.all("SELECT * FROM users WHERE email = ? and password = ?", [data.email, data.password], (err, result) => {
                if (err) {
                    res.status(500).json(err).end()
                }
                else {
                    if (result[0] == null) {
                        res.status(404).json({ "Message": "User not found" }).end()
                    }
                    else {
                        res.status(200).json(result[0]).end()
                    }
                }
            })
        }
        else {
            res.status(400).json({ "Message": "Email and password required" }).end()
        }
    }

    return login
}