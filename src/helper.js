export default function createRes(data, error = null) {
    return {
        body: data,
        error: error
    }
}