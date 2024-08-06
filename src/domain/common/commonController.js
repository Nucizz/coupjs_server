import express from 'express'
import sessionData from '../session/sessionData.js'
import createRes from '../../helper.js'


// MARK: Initialization
const commonRouter = express.Router()


// MARK: Router
commonRouter.get(`/check-session-availability/:sessionId/:playerId`, (req, res) => {
    const session = sessionData.sessionList.find(s => s.id === req.params.sessionId)

    if (session) {
        if (session.bannedPlayerIds.some(playerId => playerId === req.params.playerId)) {
            res.status(200).json(createRes({
                joinable: false,
            }, `You're banned from this session.`))
        } else if (session.status === `waiting`) {
            res.status(200).json(createRes({
                joinable: true,
            }))
        } else {
            res.status(200).json(createRes({
                joinable: false
            }, `Session has already started.`))
        }
    } else {
        res.status(200).json(createRes({
            joinable: false
        }, `Session doesn't exist.`))
    }
})


// MARK: Export
export default commonRouter