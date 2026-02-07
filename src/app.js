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

/**
 * @route GET /leaderboard/score-range
 * @description retrieve members within a score range
*/
app.get('/leaderboard/score-range', async (req, res) => {
  try {
    // returns score between 0 and 20
    const results = await redis.zRangeByScore('leaderboard', 0, 20);

    res.status(200).json({ results });
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

/**
 * @route DEL /leaderboard/:name
 * @description remove a record
*/
app.delete('/leaderboard/:name', async (req, res) => {
  try {
    const name = String(req.params.name);
    if (!name) return res.status(400).json({ message: 'name required.' });

    const result = await redis.zRem('leaderboard', name);

    res.status(200).send(`removed ${result}`);
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

/**
 * @route GET /leaderboard/:name
 * @description get a user's current ranking
*/
app.get('/leaderboard/:name', async (req, res) => {
  try {
    const name = String(req.params.name);
    if (!name) return res.status(400).json({ message: 'name required.' });

    /* 
      zRank fetches in uhhh.. descending order, meaning
      the lesser the score the higher its ranked.
      in this case, i wanna put the user that has the highes score
      on rank 1, so zRevRank would be the right function to use 
    */

    // const result = await redis.zRank('leaderboard', name);
    const result = await redis.zRevRank('leaderboard', name);
    if (typeof result == NaN) return res.status(404).json({ message: 'user does not exists.' });

    res.status(200).send(`${name} is rank ${result + 1}`); // its zero-based, to i added 1
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})



app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})