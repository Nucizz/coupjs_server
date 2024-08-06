import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { config as initDotenv } from 'dotenv'
import sessionController from './src/domain/session/sessionController.js'
import Constant from './src/constant.js'
import commonRouter from './src/domain/common/commonController.js'
import { instrument } from '@socket.io/admin-ui'


// MARK: Initialization
initDotenv()
const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: `*`,
        credentials: true
    }
})
app.use(cors())


// MARK: Route
app.use(`/socket-admin`, express.static(`./node_modules/@socket.io/admin-ui/ui/dist`))
app.use(`/common`, commonRouter)
app.get(`/`, (req, res) => res.send(Constant.DEFAULT_HTML))
app.get(`*`, (req, res) => res.status(404).send(Constant.NOT_FOUND_HTML))


// MARK: Socket
instrument(io, {
    auth: false,
    mode: `development`,
})
sessionController(io)


// MARK: Execution
server.listen(process.env.SERVER_PORT, () => {
    console.clear()
    console.log(`Le Coup server running at port ${process.env.SERVER_PORT}`)
})