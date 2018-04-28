module.exports = (app) => {
   var fs = app.get("fs")

   app.get("/:nomePasta/:param", (req,res) => {
     let nomePasta = req.params.nomePasta
     let param = req.params.param
     let exp = new RegExp("[.]")
     let result = param.search(exp)
     if (result==-1) {
       fs.readdir(`./data/${nomePasta}/${param}`, (err,data) => {
          if (err) {
             res.status(404).json({"Mensagem":"Subpasta não encontrada"})
          }
          else {
             res.status(200).json(data)
          }
       })
     }
     else {
       const objeto = fs.createReadStream(`./data/${nomePasta}/${param}`)
       objeto.on("error",(err) => {
         res.status(404).json({"Mensagem":"Objeto não encontrado"})
       })
       objeto.pipe(res)
     }
   })

   app.get("/:nomePasta/:nomeSubPasta/:objeto",(req,res) => {
     let nomePasta = req.params.nomePasta
     let nomeSubPasta = req.params.nomeSubPasta
     let obj = req.params.objeto

     const objeto = fs.createReadStream(`./data/${nomePasta}/${nomeSubPasta}/${obj}`)
     objeto.on("error",(err) => {
       res.status(404).json({"Mensagem":"Objeto não encontrado"})
     })
     objeto.pipe(res)
   })
}
