const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const Sequelize = require("sequelize")
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const Sse = require('json-sse')

const db = new Sequelize(databaseUrl)

const stream = new Sse()
console.log('stream', stream)

const Chatroom = db.define('chatroom', {
  message: Sequelize.STRING,
  user: Sequelize.STRING
})

function onListen() {
  console.log(`Server running on port ${port}`)
}

app.use(jsonParser)
app.listen(port, onListen)

app.get('/', (req, res, next) => {
  console.log("request received")
  res.status(200).send("Received")
})

app.post('/message', async(req, res, next) => {
  console.log("got a request on /message")
  const { message, user } = req.body
  const entity = await Chatroom
    .create({ message, user })
    .then(message => res.json(message))
    .then(res.status(200))
    .catch(next)
  console.log(entity)  

  const room = await Chatroom.findAll()
  const data = JSON.stringify(room)
  stream.send(data)
})

app.get('/stream', async (req, res) => {
  console.log('got a request for a stream')
  const room = await Chatroom.findAll()
  const data = JSON.stringify(room)
  console.log("messages in this room are:", data)

  stream.updateInit(data)
  stream.init(req, res)
})

db.sync({ force: false })
  .then(() => console.log("Database synchronized"))
  .catch((error) => console.log("Got an error", error))