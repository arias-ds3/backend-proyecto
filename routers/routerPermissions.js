const express = require('express');

const routerPermissions= express.Router();
const database = require("../database")

routerPermissions.get("/", async (req,res)=>{
    // from apiKey
    let idUser = req.infoInApiKey.id

    database.connect();
    let users = await database.query('SELECT * FROM users WHERE id = ?',[idUser])

    let permissions = []
    if ( users.length > 0){
        if (users[0].role == "admin"){
            // get all
            permissions = await database.query('SELECT * FROM permissions')
        } else {
            // get permissions only if this user
            permissions = await database.query('SELECT * FROM permissions WHERE idUser = ?',[idUser])
        }
    }

    database.disConnect();
    res.send(permissions)
})

routerPermissions.get('/:id', async (req, res) => {
    let id = req.params.id;

    if ( id == undefined ){
        return res.status(400).json({error: "no id param"})
    }

    database.connect();
    const permissions = await database.query('SELECT permissions.* , users.email FROM permissions JOIN users ON permissions.idUser = users.id WHERE permissions.id = ?', [id])
    if (permissions.length < 1){
        database.disConnect();
        return res.status(400).json({error: "Not item with this id"})
    } else {
        database.disConnect();
        return res.send(permissions[0])
    }
});

routerPermissions.post("/", async (req,res)=>{
    let idUser = req.infoInApiKey.id
    let comment = req.body.comment
    let dateInit = Date.now()
    let dateLastModified = dateInit
    let state = 0;

    if ( comment == undefined ){
        return res.status(400).json({error: "no comment param"})
    }

    database.connect();

    let insertedPermission = null;
    try {
        insertedPermission = await database.query(
            'INSERT INTO permissions (idUser,comment,dateInit,dateLastModified,state) VALUES (?,?,?,?,?)',
            [idUser, comment, dateInit,dateLastModified,state])

    } catch (e){
        database.disConnect();
        return res.status(400).json({error: e})
    }

    database.disConnect();
    res.json({inserted: insertedPermission})
})


routerPermissions.put("/:id", async (req,res)=>{
    // from apiKey
    let idUser = req.infoInApiKey.id

    // you have to bee admin
    let idPermission = req.params.id
    let comment = req.body.comment
    let dateLastModified = Date.now()
    let state = parseInt(req.body.state);

    if ( comment == undefined ){
        return res.status(400).json({error: "no comment param"})
    }
    if ( [0,1,2,3].includes(state) == false){
        return res.status(400).json({error: "no valid state"})
    }

    database.connect();

    let updatedPermission = null;
    try {

        let users = await database.query('SELECT * FROM users WHERE id = ?',[idUser])
        if ( users.length > 0){
            if (users[0].role == "admin"){
                // get all
                updatedPermission = await database.query(
                    'UPDATE permissions SET comment = ?, state = ?, dateLastModified = ? WHERE id = ? ', 
                    [comment,state,dateLastModified,idPermission])
            } 
        }



    } catch (e){
        database.disConnect();
        return res.status(400).json({error: e})
    }

    database.disConnect();
    res.json({modifiyed: updatedPermission})
})

module.exports=routerPermissions