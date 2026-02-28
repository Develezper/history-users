// User Story M4S3 - StreamHub
// User and content management using MongoDB
// Author: DeVelezper

// Script executed in mongosh (MongoDB Shell)
// The syntax is based on JavaScript

// Select database
use streamhub

// Insert users
db.usuarios.insertMany([
  {
    nombre: "Ana",
    email: "ana@mail.com",
    edad: 22,
    pais: "Colombia",
    historial: [],
    fechaRegistro: new Date()
  },
  {
    nombre: "Carlos",
    email: "carlos@mail.com",
    edad: 30,
    pais: "México",
    historial: [],
    fechaRegistro: new Date()
  }
])

// Insert content
db.contenidos.insertMany([
  {
    titulo: "Inception",
    tipo: "movie",
    genero: ["Science Fiction", "Action"],
    duracion: 148,
    estreno: 2010,
    calificacionPromedio: 4.8
  },
  {
    titulo: "Dark",
    tipo: "series",
    genero: ["Drama", "Science Fiction"],
    duracion: 60,
    temporadas: 3,
    estreno: 2017,
    calificacionPromedio: 4.9
  },
  {
    titulo: "Interstellar",
    tipo: "movie",
    genero: ["Science Fiction", "Drama"],
    duracion: 169,
    estreno: 2014,
    calificacionPromedio: 4.7
  }
])

// Queries (find)

// Movies with duration greater than 120 minutes
db.contenidos.find({ duracion: { $gt: 120 } })

// Series released after 2015
db.contenidos.find({
  $and: [
    { tipo: "series" },
    { estreno: { $gt: 2015 } }
  ]
})

// Search using regular expression
db.contenidos.find({
  titulo: { $regex: /in/i }
})

// Use of $in operator
db.contenidos.find({
  tipo: { $in: ["movie", "series"] }
})

// Update content rating
db.contenidos.updateOne(
  { titulo: "Inception" },
  { $set: { calificacionPromedio: 4.9 } }
)

// Delete old content
db.contenidos.deleteMany({
  estreno: { $lt: 2005 }
})

// Indexes
db.contenidos.createIndex({ titulo: 1 })
db.contenidos.createIndex({ genero: 1 })
db.usuarios.createIndex({ email: 1 }, { unique: true })

// Index verification
db.contenidos.getIndexes()
db.usuarios.getIndexes()

// Aggregations

// Average rating by content type
db.contenidos.aggregate([
  {
    $group: {
      _id: "$tipo",
      averageRating: { $avg: "$calificacionPromedio" }
    }
  },
  { $sort: { averageRating: -1 } }
])

// Number of contents by genre
db.contenidos.aggregate([
  { $unwind: "$genero" },
  {
    $group: {
      _id: "$genero",
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
])