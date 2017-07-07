connection = new Mongo('mongodb://172.17.0.2:27017')

db = connection.getDB('admin')
db.createUser(
  {
    user: "admin",
    pwd: "password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

db = connection.getDB('portfolio')
db.accounts.createIndex({ email: 1 }, { unique: true })

db = connection.getDB('users')
db.createUser(
  {
    user: "portfolio",
    pwd: "password",
    roles: [ { role: "readWrite", db: "portfolio" } ]
  }
)