const express = require('express')
const redis = require('./lib/redis')
// routes
const sortedSetsRoute = require('./sortedsets')
const hashesRoute = require('./hashes')
// end routes

redis.on('error', (err) => console.log('Error connecting to Redis', err))
redis.connect().then(() => console.log('Redis connected'))

var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use('/leaderboard', sortedSetsRoute);
app.use('/hashes', hashesRoute);


// ================ TEST ================ 

app.post('/manga', async (req, res) => {
  try {
    const { author, volumes, isFinished, rating } = req.body;
    const generatedId = crypto.randomUUID();
    const key = `manga:${generatedId}`

    // store the manga's data in hash
    await redis.hSet(key, {
      author,
      volumes,
      isFinished
    });


    // store the manga in a sorted set to sort by rating
    await redis.zAdd('mangas', { score: rating, value: generatedId })

    res.status(200).send('OK')
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})



app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})
