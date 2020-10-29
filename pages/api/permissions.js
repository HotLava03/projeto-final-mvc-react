import { AuthManager } from './auth'

export default (req, res) => {
  // Get the token from the headers.
  const { token } = req.headers
  // If the token isn't given, HTTP status 400.
  if (!token) return res.status(400).json({ message: 'No token provided.' })
  // Get the instance of AuthManager.
  const manager = AuthManager.getInstance()
  // Check if the token is valid. If yes, return the username with a 200 status. Else, HTTP 401 status.
  if (!manager.userSessions[token]) return res.status(401).json({ message: 'The provided token is invalid or expired.' })
  res.json({ permissions: manager.getPermissionsForSession(token) })
}