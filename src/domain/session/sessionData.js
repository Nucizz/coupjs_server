import Constant from '../../constant.js'
import playerData from '../player/playerData.js'

// MARK: Data
const sessionData = {
    sessionList: [
        {
            id: `000000`,
            status: Constant.SESSION.STATUS.WAITING,
            sessionMasterId: `sessionMasterId`,
            playerIds: [`sessionMasterId`],
            bannedPlayerIds: []
        },
        {
            id: `123456`,
            status: Constant.SESSION.STATUS.PLAYING,
            sessionMasterId: `sessionMasterId`,
            playerIds: [`sessionMasterId`],
            bannedPlayerIds: []
        }
    ]
}


// MARK: Modifier
function getSession(id) {
    return sessionData.sessionList.find(s => s.id === id)
}

function getSessionData(id) {
    const session = getSession(id)
    if (session) {
        const copy = { ...session } 
        copy.playerList = copy.playerIds.map(playerId => {
            const player = playerData.playerList.find(player => player.id === playerId)
            if (player) {
                const { sessionId, ...playerWithoutSessionId } = player
                return playerWithoutSessionId
            }
            return null
        }).filter(player => player !== null)
        delete copy.playerIds
        return copy
    }
    return session
}

function pushSession(sessionMasterId) {
    const sessionId = generateSessionId()
    sessionData.sessionList.push({
        id: sessionId,
        status: Constant.SESSION.STATUS.WAITING,
        sessionMasterId: sessionMasterId,
        playerIds: [],
        bannedPlayerIds: []
    })
    return sessionId
}

function popSession(sessionId) {
    sessionData.sessionList = sessionData.sessionList.filter(s => s.id !== sessionId)
}

function banPlayer(player) {
    const session = getSession(player.sessionId)
    session.bannedPlayerIds.push(player.id)
}


// MARK: Private
function generateSessionId() {
    let sessionId
    do {
        sessionId = Math.floor(100000 + Math.random() * 900000).toString()
    } while (sessionData.sessionList.some(s => s.id === sessionId))
    return sessionId
}


// MARK: Exports
export default sessionData
export { getSession, getSessionData, pushSession, popSession, banPlayer }