/* 
  Redis hashes are record types structured as collections of field-value pairs.
*/

const express = require('express')
const router = express.Router()
const redis = require('./lib/redis')

/**
 * @route POST /hashes
 * @description add a record in a hash 
 */

router.post('/', async (req, res) => {
  try {
    const result = await redis.hSet(
      'collection:1',
      {
        'id': crypto.randomUUID(),
        'desc': 'this is a description field for collection 1',
      }
    )

    res.status(201).json({ result });

  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }

})


module.exports = router;