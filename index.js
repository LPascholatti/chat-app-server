const express = require('express')
const app = express()
const port = process.env.PORT || 4000 
const Sequelize = require("sequelize")
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'

const db = new Sequelize(databaseUrl)

function onListen() {
console.log(`Server running on port ${port}`)
}

app.listen(port, onListen)

db.sync({force: false})
.then(() => console.log("Database synchronized"))
.catch((error) => console.log("Got an error", error))