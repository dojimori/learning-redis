/* 
  Redis hashes are record types structured as collections of field-value pairs.
*/

const express = require('express')
const router = express.Router()

/**
 * @route POST /hashes
 * @description add a record in a hash 
 */

router.post('/', async (req, res) => {
  try {
    // const result = await 

  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }

})


module.exports = router;