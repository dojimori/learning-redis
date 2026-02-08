const express = require('express')

const router = express.Router()

/**
 * @route POST /leaderboard
 * @description add/update record to leaderboard
 */
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
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
router.get('/score-range', async (req, res) => {
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
router.delete('/:name', async (req, res) => {
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
router.get('/:name', async (req, res) => {
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

    res.status(200).send(`${name} is rank ${result + 1}`); // its zero-based, so i added 1
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

/**
 * @route PUT /leaderboard/:name
 * @description increment score of a user
*/
router.put('/:name', async (req, res) => {
  try {
    const { incrementBy } = req.body;
    if (!incrementBy) return res.status(400).json({ message: 'incrementBy required.' });

    const name = String(req.params.name)
    console.log("name is here", name, incrementBy)

    await redis.zIncrBy('leaderboard', Number(incrementBy), name);

    res.status(200).send(`Score for ${name} is incremented by ${incrementBy}`);
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})


export default router;