module.exports = (app) => {
    var login = app.controller.login
    var version = "/v1"

    app.put(version + "/login", login.user)
}