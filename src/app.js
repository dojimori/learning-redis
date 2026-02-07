const express = require('express')
const axios = require('axios')
const { createClient } = require('redis')

const redis = createClient()

redis.on('error', (err) => console.log('Error connecting to Redis', err))
redis.connect().then(() => console.log('Redis connected'))

var app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/**
 * @route POST /leaderboard
 * @description add/update record to leaderboard
 */
app.post('/leaderboard', async (req, res) => {
  try {
    const { score, player } = req.body;
    if (!score || !player) return res.status(400).json({ message: 'score and player required.' });

    await redis.zAdd('leaderboard', { score: parseInt(score), value: player });

    res.status(200).send('leaderboard updated')
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

/**
 * @route GET /leaderboard
 * @description fetch  leaderboard records 
 */
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await redis.zRangeWithScores('leaderboard', 0, -1, { REV: true });
    res.status(200).json({ result });

  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})