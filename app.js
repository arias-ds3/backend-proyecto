const express = require('express')
const jwt = require("jsonwebtoken"); // INSTALAR
const activeApiKeys = require("./activeApiKeys")
const port = 4000

const routerUsers= require("./routers/routerUsers")
const routerPermissions= require("./routers/routerPermissions")

const app = express()

var cors = require('cors')
app.use(cors())

app.use(express.json())

app.use(["/permissions","/users/checklogin"] ,(req,res,next)=>{
	console.log("middleware execution")

	let apiKey = req.query.apiKey
	if ( apiKey == undefined ){
		res.status(401).json({ error: "no apiKey" });
		return 
	}
	let infoInApiKey = jwt.verify(apiKey, "secret");
	if ( infoInApiKey == undefined || activeApiKeys.indexOf(apiKey) == -1){
		res.status(401).json({ error: "invalid apiKey" });
		return 	
	}

	// desencrypted in req
	req.infoInApiKey = infoInApiKey;
  next()
})

app.use("/users", routerUsers)
app.use("/permissions", routerPermissions)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})