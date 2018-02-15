var app = require("./config/express")

app.listen(app.get("port"),() => {
   console.log("Servidor Rodando na Porta " + app.get("port"))
})
