import { createConnection } from 'mysql'
import config from '../../config.json'
import { promisify } from 'util'
import crypto from 'crypto'

export default (req, res) => {
  // Get the token from the headers.
  const { token } = req.headers
  // If the token isn't given, HTTP status 400.
  if (!token) return res.status(400).json({ message: 'No token provided.' })
  // Get the instance of AuthManager.
  const manager = AuthManager.getInstance()
  // Check if the token is valid. If yes, return the username with a 200 status. Else, HTTP 401 status.
  if (!manager.validateSession(token)) return res.status(401).json({ message: 'The provided token is invalid or expired.' })
  res.json({ username: manager.validateSession(token) })
}

// Outros.
const SELECT_LOGIN_SOCIO = 'SELECT * FROM Socio WHERE login = ?'
const UPDATE_SESSIONS_SOCIO = 'UPDATE Socio SET sessao = ? WHERE login = ?'
const SELECT_FROM_PERMISSIONS_BY_SOCIO_ID = 'SELECT * FROM Permission WHERE idSocio = ?'
const SELECT_FROM_QUOTA_BY_SOCIO_ID = 'SELECT * FROM Quota WHERE idSocio = ?'

// Admin Associação.
const INSERT_INTO_ASSOCIACAO = 'INSERT INTO Associacao (nome, morada, telefone, numContribuinte) VALUES (?, ?, ?, ?)'
const UPDATE_ASSOCIACAO = 'UPDATE Associacao SET nome = ?, morada = ?, telefone = ?, numContribuinte = ? WHERE idAssociacao = ?'
const SELECT_FROM_ASSOCIACAO = 'SELECT * FROM Associacao'
const DELETE_FROM_ASSOCIACAO = 'DELETE FROM Associacao WHERE idAssociacao = ?'
const SELECT_FROM_ASSOCIACAO_BY_ID = 'SELECT * FROM Associacao WHERE idAssociacao = ?'

// Admin Evento.
const INSERT_INTO_EVENTO = 'INSERT INTO Evento (idAssociacao, titulo, evento, `data`) VALUES (?, ?, ?, ?)'
const UPDATE_EVENTO = 'UPDATE Evento SET idAssociacao = ?, titulo = ?, evento = ?, `data` = ? WHERE idEvento = ?'
const SELECT_FROM_EVENTO = 'SELECT * FROM Evento'
const DELETE_FROM_EVENTO = 'DELETE FROM Evento WHERE idEvento = ?'
const SELECT_FROM_EVENTO_BY_ID = 'SELECT * FROM Evento WHERE idEvento = ?'

// Admin Socio.
const INSERT_INTO_SOCIO = 'INSERT INTO Socio (nome, email, login, password, idAssociacao) VALUES (?, ?, ?, ?, ?)'
const UPDATE_SOCIO = 'UPDATE Socio SET nome = ?, email = ?, login = ?, password = ?, idAssociacao = ? WHERE idSocio = ?'
const SELECT_FROM_SOCIO = 'SELECT * FROM Socio'
const DELETE_FROM_SOCIO = 'DELETE FROM Socio WHERE idSocio = ?'
const SELECT_FROM_SOCIO_BY_ID = 'SELECT * FROM Socio WHERE idSocio = ?'

// Admin Permission.
const INSERT_INTO_PERMISSION = 'INSERT INTO Permission (nome, idSocio) VALUES (?, ?)'
const UPDATE_PERMISSION = 'UPDATE Socio SET nome = ?, idSocio = ? WHERE idPermission = ?'
const SELECT_FROM_PERMISSION = 'SELECT * FROM Permission'
const DELETE_FROM_PERMISSION = 'DELETE FROM Permission WHERE idPermission = ?'
const SELECT_FROM_PERMISSION_BY_ID = 'SELECT * FROM Permission WHERE idPermission = ?'

// Admin Notícia.
const INSERT_INTO_NOTICIA = 'INSERT INTO Noticia (titulo, noticia, imagem, idAssociacao) VALUES (?, ?, ?, ?)'
const UPDATE_NOTICIA = 'UPDATE Noticia SET titulo = ?, noticia = ?, imagem = ?, idAssociacao = ? WHERE idNoticia = ?'
const SELECT_FROM_NOTICIA = 'SELECT * FROM Noticia'
const DELETE_FROM_NOTICIA = 'DELETE FROM Noticia WHERE idNoticia = ?'
const SELECT_FROM_NOTICIA_BY_ID = 'SELECT * FROM Noticia WHERE idNoticia = ?'

// Admin Quota.
const INSERT_INTO_QUOTA = 'INSERT INTO Quota (idSocio, dataComeco, dataTermino, preco) VALUES (?, ?, ?, ?)'
const UPDATE_QUOTA = 'UPDATE Quota SET idSocio = ?, dataComeco = ?, dataTermino = ?, preco = ? WHERE idQuota = ?'
const SELECT_FROM_QUOTA = 'SELECT * FROM Quota'
const DELETE_FROM_QUOTA = 'DELETE FROM Quota WHERE idQuota = ?'
const SELECT_FROM_QUOTA_BY_ID = 'SELECT * FROM Quota WHERE idQuota = ?'

// Inscrições.
const INSERT_INTO_INSCRICAO = 'INSERT INTO Inscricao (idSocio, idEvento) VALUES (?, ?)'
const DELETE_FROM_INSCRICAO = 'DELETE FROM Inscricao WHERE idEvento = ?'
const SELECT_FROM_INSCRICAO = 'SELECT * FROM Inscricao WHERE idSocio = ?'

export class AuthManager {
  constructor() {
    // Initialize database connection.
    this.db = createConnection({
      host: config.hostname,
      user: config.dbUser,
      password: config.dbPassword,
      charset: config.dbCharset,
      database: config.dbName
    })
    // Connect.
    this.db.connect(err => {
      if (err) return console.log('Failed to connect to database: ' + err)
      console.log('Connected to MySQL database successfully.')
    })
    // Retrieve all sessions.
    this.userSessions = this.retrieveSessions()
    // Query with async/await.
    this.query = promisify(this.db.query).bind(this.db)
  }
  
  static getInstance() {
    if (!AuthManager.instance) AuthManager.instance = new AuthManager()
    return AuthManager.instance
  }

  async retrieveSessions() {
    // Query.
    let rows
    try {
      rows = await this.query(SELECT_FROM_SOCIO)
    } catch (e) {
      console.log(e)
      return {}
    }

    const toReturn = {}
    for (const row of rows) {
      toReturn[row.sessao] = row.login
    }

    return toReturn
  }

  validateSession(token) {
    if (!token) return
    return manager.userSessions[token]
  }

  async login(login, password) {
    // Before we create a new session...
    for (const token in userSessions) {
      if (userSessions[token] === username) return token
    }
    
    if (!(login && password)) return

    // Query.
    let rows
    try {
      rows = await this.query(SELECT_LOGIN_SOCIO, [login])
    } catch (e) {
      console.log(e)
      return
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (rows.password === hashedPassword) {
      const token = crypto.createHash('sha256').update(new Date().getUTCMilliseconds()).digest('hex')
      this.userSessions[token] = login
      // Update the session in the database.
      try {
        await this.query(UPDATE_SESSIONS_SOCIO, [token, login])
      } catch (e) {
        console.log(e)
        return
      }

      return token;
    }
  }

  async getUserIdByUsername(username) {
    if (!username) return
    // Query.
    let rows
    try {
      rows = await this.query(SELECT_LOGIN_SOCIO, [username])
    } catch (e) {
      console.log(e)
      return
    }

    return rows.idSocio
  }

  async getPermissionsFor(userId) {
    if (!userId) return
    // Query.
    let rows
    try {
      rows = await this.query(SELECT_FROM_PERMISSIONS_BY_SOCIO_ID, [userId])
    } catch (e) {
      console.log(e)
      return
    }

    const toReturn = []
    for (const row of rows) toReturn.push(row.name)

    return toReturn
  }

  async getPermissionsForUsername(username) {
    return this.getPermissionsFor(this.getUserIdByUsername(username))
  }

  async getPermissionsForSession(token) {
    return this.getPermissionsForUsername(this.userSessions[token])
  }
}