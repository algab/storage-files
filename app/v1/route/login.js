module.exports = (app) => {
    var login = app.controller.login
    var version = "/v1"

    app.post(version + "/login",login.user)
}