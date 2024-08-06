// MARK: Data
const playerData = {
    playerList: []
}


// MARK: Action
function getPlayer(id) {
    return playerData.playerList.find(p => p.id === id)
}

function pushPlayer(socketId, name, avatarIndex) {
    playerData.playerList.push({
        id: socketId,
        name: name,
        avatarIndex: avatarIndex
    })
}

function popPlayer(socketId) {
    playerData.playerList = playerData.playerList.filter(p => p.id !== socketId)
}


// MARK: Exports
export default playerData
export { getPlayer, pushPlayer, popPlayer }