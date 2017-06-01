const express = require('express')
const SocketServer = require('ws').Server
const uuidV4 = require('uuid/v4')

// Set the port to 3001
const PORT = 3001

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`))

// Create the WebSockets server
const wss = new SocketServer({ server })

// store all messages to send every newly conncted user
const messages = []
const colours = ['navy', 'fuchsia', 'lime', 'teal']

const rndColor = () => Math.floor(Math.random() * 4)
let counter = 0
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

// Broadcast-to-all function
wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(c => c.send(JSON.stringify(msg)))
}

wss.on('connection', (ws) => {
  console.log('Client connected')
  counter++
  // Pick a new colour
  let userColour = colours[rndColor()]
  // Send it to user
  ws.send(JSON.stringify({colour: userColour }))
  // Send existing messages too
  messages.forEach(message => {
    ws.send(JSON.stringify({message, counter}))
  })
  // Update the counter
  wss.broadcast({counter})
  // handle incoming message
  ws.on('message', function incoming(data) {
    let {message} = JSON.parse(data)
    let {type} = message

    message.id = uuidV4()

    if (type === 'postNotification') {
      message.type = 'incomingNotification'
    }
    else {
      message.type = 'incomingMessage'
    }

    messages.push(message)

    wss.broadcast({message})
  })
  // Set up a callback for when a client closes the socket.
  ws.on('close', () => {
    console.log('Client disconnected')
    counter--
    wss.broadcast({counter})
  })
})
