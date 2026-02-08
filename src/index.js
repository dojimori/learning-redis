const express = require('express')
const { createClient } = require('redis')

// routes
const sortedSetsRoute = require('./sortedsets')
// end routes

const redis = createClient()


redis.on('error', (err) => console.log('Error connecting to Redis', err))
redis.connect().then(() => console.log('Redis connected'))

var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use('/leaderboard', sortedSetsRoute);

app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})
