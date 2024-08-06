
import sessionData, { banPlayer, getSession, getSessionData, popSession, pushSession } from './sessionData.js'
import playerData, { getPlayer, popPlayer, pushPlayer } from '../player/playerData.js'
import createRes from '../../helper.js'


// MARK: Socket
export default function sessionController(io) {
    io.on(`connection`, (socket) => {
        onConnection(socket)

        socket.on(`disconnect`, () => onDisconnect(socket, io))
        socket.on(`post-player-data`, (data) => postPlayerData(socket, data)) 
        socket.on(`create-session`, () => createSession(socket, io))
        socket.on(`join-session`, (data) => joinSession(socket, data, io))
        socket.on(`remove-player-from-session`, (data) => removePlayerFromSession(data, io))
    })

    io.on(`error`, (error) => onError(error))
}


// MARK: Common
function onConnection(socket) {
    console.log(`[Socket.IO][LOG] Client ${socket.id} has connected.`)
}

function onDisconnect(socket, io) {
    removePlayerSessionId(socket.id, io)
    popPlayer(socket.id)
    console.log(`[Socket.IO][LOG] Client ${socket.id} has disconnected.`)
}

function onError(error) {
    console.error(`[Socket.IO][ERROR] ${error}`)
}


// MARK: Action
function postPlayerData(socket, data) {
    pushPlayer(socket.id, data.name, data.avatarIndex)
    socket.emit(`on-player-data-updated`, createRes({
        playerId: socket.id
    }))
    console.log(`[Socket.IO][LOG] Client ${socket.id} has updated their data as ${data.name} -ava${data.avatarIndex}.`)
}

function createSession(socket, io) {
    const sessionId = pushSession(socket.id)
    if (sessionId) {
        console.log(`[Socket.IO][LOG] Client ${socket.id} has created session ${sessionId}.`)
        joinSession(socket, {sessionId: sessionId}, io)
    } else {
        socket.emit(`session-created`, createRes(null, `Failed to create session.`))
    }
}

function joinSession(socket, data, io) {
    if (data.sessionId) {
        const session = getSession(data.sessionId)
        if (io && session && setPlayerSessionId(socket, session, io)) {
            console.log(`[Socket.IO][LOG] Client ${socket.id} has joined session ${data.sessionId}.`)
        } else {
            socket.emit(`session-joined`, createRes(null, `Failed to join session.`))
        }
    } else {
        socket.emit(`session-joined`, createRes(null, `Session doesn't exist.`))
    }
}

function removePlayerFromSession(data, io) {
    banPlayer(getPlayer(data.playerId))
    removePlayerSessionId(data.playerId, io)
}


// MARK: Helpers
function setPlayerSessionId(socket, session, io) {
    try {
        const player = playerData.playerList.find(p => p.id === socket.id)
        if (player && session) {
            session.playerIds.push(socket.id)
            const sessionData = getSessionData(session.id)
            player.sessionId = sessionData.id

            socket.join(sessionData.id)
            socket.emit(`session-joined`, createRes({
                session: sessionData
            }))
            io.to(sessionData.id).emit(`player-list-updated`, createRes({
                playerList: sessionData.playerList
            }))
            return true
        } else {
            console.error(`[Socket.IO][LOG] Unable to find either session ${session.id} or client ${socket.id} from data.`)
            return false
        }
    } catch {
        console.error(`[Socket.IO][LOG] Unable to access either session[${session.id}]'s playerId list or client[${socket.id}]'s sessionId from data.`)
        return false
    }
}

function removePlayerSessionId(socketId, io) {
    try {
        const player = getPlayer(socketId)
        const session = getSession(player.sessionId)
        if (session) {
            session.playerIds = session.playerIds.filter(p => p !== socketId)
            io.to(player.sessionId).emit(`player-list-updated`, createRes({
                playerList: getSessionData(player.sessionId).playerList
            }))

            // TODO: Fix this bug, where socket needs to leave the room
            const socket = io.sockets.sockets.get(socketId)
            if (socket) {
                console.log(`[Socket.IO][LOG] Client ${socketId} has left session ${player.sessionId}.`)
                socket.leave(session.id)
            }

            if (session.playerIds.length <= 0) {
                console.log(`[Socket.IO][LOG] Due to empty client, session ${session.id} has been popped out from list.`)
                popSession(session.id)
            }
        } else {
            console.error(`[Socket.IO][LOG] Unable to find client[${socketId}]'s session.`)
        }
    } catch {
        console.error(`[Socket.IO][LOG] Unable to pop client ${socketId} from their session.`)
    }
}