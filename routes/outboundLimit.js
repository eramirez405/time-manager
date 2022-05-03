const express = require('express');
const router = express.Router();
const add = require('date-fns/add');
const set = require('date-fns/set');

const OutboundRecord = require('../models/OutboundRecord');
const OutboundEvent = require('../models/OutboundEvent');

// @route   GET /api/outbound/:number
// @desc    verify if allowed to make call to certain number
// @access  Public
router.get('/:number', async (req, res) => {
  try {
    const number = req.params.number;

    if (!!number) {
      let result2 = await OutboundRecord.findOne({
        number,
        available: false,
        dateNotAllowed: { $lt: new Date() },
      });
      if (!!result2) {
        result2.available = true;
        await result2.save();
      }

      const result = await OutboundRecord.findOne({ number: number });

      !!result ? res.json(result) : res.json({ result: 'canCall' });
    } else {
      throw 'No number param received';
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Something Went Wrong', content: err });
  }
});

// @route   POST /api/outbound
// @desc    if call is not successfull, count for the record
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { number, duration, agent } = req.body;

    if (!!number && !!duration) {
      // Save the event
      let event = new OutboundEvent({
        number,
        duration,
        timestamp: new Date(),
        agent,
      });
      await event.save();
      //Originally duration is 85 but as not we want to integrate all type of calls lets make it more than 20 seconds on the client to make sure the call landed and handle all the calls in the server
      //To remove it commented lines 57-59, 92
      // if (duration > 85) {
      //   res.send('Successfull call, no need to register!');
      // } else {
      const record = new OutboundRecord({
        number: number,
        count: 1,
        date: new Date(),
        available: true,
      });

      const found = await OutboundRecord.findOne({ number }).exec();
      if (!!found && found.available === true) {
        found.count = found.count + 1;
        found.date = new Date();
        //Originally if 2 added 1 hour time out, removed this functionallity
        // if (found.count === 2) {
        //   found.dateNotAllowed = add(new Date(found.date), { hours: 1 });
        //   found.available = false;
        // }
        //Originally 4 but raised to 8
        if (found.count >= 8) {
          found.dateNotAllowed = set(add(new Date(), { days: 1 }), {
            hours: 5,
            minutes: 0,
          });
          found.available = false;
        }
        await found.save();
        res.json(found);
      } else if (!!found && found.available === false) {
        throw 'Not supposed to happen, contact support!';
      } else {
        await record.save();
        res.json(record);
      }
      // }
    } else {
      throw 'Missing params';
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Something Went Wrong', content: err });
  }
});

// @route   PUT /api/outbound/:number
// @desc    force reset
// @access  Public
router.put('/:number', async (req, res) => {
  try {
    const { number } = req.params;

    if (!!number) {
      const found = await OutboundRecord.findOne({ number: number }).exec();
      if (!!found) {
        found.count = 2;
        found.available = true;
        delete found.dateNotAllowed;
        await found.save();
        res.json(found);
      } else {
        throw 'No record found with this number';
      }
    } else {
      throw 'No number param received';
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Something Went Wrong', content: err });
  }
});

module.exports = router;
