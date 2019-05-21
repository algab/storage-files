module.exports = (app) => {
    var login = app.controllers.login
    var version = "/v1"

    app.put(version + "/login", login.user)
}