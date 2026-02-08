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

/**
 * @route POST /manga
 * @description store manga's data inside a hash, and use sorted sets to  sort them by rating
*/
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

/**
 * @route GET /manga
 * @description retrieve sorted manga by rating with their additional data 
*/
app.get('/manga', async (req, res) => {
  try {
    // the sorted set contains the sorted manga by rating
    const sortedMangas = await redis.zRangeWithScores('mangas', 0, -1, { REV: true });

    /**
     * the hash contains the additional information of the manga,
     * the hash is not sorted so we loop through all the sorted manga
     * and get their information respectively.
    */

    const mangas = await Promise.all(sortedMangas.map(async (manga) => {
      const data = await redis.hGetAll(`manga:${manga.value}`)
      return {
        ...data,
        rating: manga.score
      };
    }))


    res.status(200).json(mangas)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})


app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})
