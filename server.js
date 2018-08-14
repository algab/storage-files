const app = require("./config/express")

app.listen(app.get("port"),() => {
    console.log(`Server Running on Port ${app.get("port")}`);    
})