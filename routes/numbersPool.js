const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const NumberItem = require('../models/Number');

// @route   GET /
// @desc    get an available number from the pool
// @access  Private
router.get(
  '/',
  //   auth,
  async (req, res) => {
    try {
      const { token } = req.headers;
      if (token === '20210310SecretToken') {
        const result = await NumberItem.findOne({ count: { $lt: 100 } }).sort([
          ['order', 1],
        ]);
        if (!!result) {
          result.count = result.count + 1;
          result.save();
          res.send(result);
        } else {
          await NumberItem.updateMany({}, { $set: { count: 0 } });
          const result = await NumberItem.findOne({
            count: { $lt: 100 },
          }).sort([['order', 1]]);
          result.count = result.count + 1;
          result.save();
          res.send(result);
        }
      } else {
        res.send({ error: 'Unauthorized' });
      }
    } catch (err) {
      console.log(err);
      res.send({ error: 'Something Went Wrong', content: err });
    }
  }
);

// @route   GET /getAll
// @desc    get all numbers in the pool
// @access  Private
router.get('/getAll', auth, async (req, res) => {
  try {
    const result = await NumberItem.find({});
    res.json({ result });
  } catch (err) {
    res.json({
      error: 'Something Happened, contact support!',
      content: err,
    });
  }
});

// @route   DELETE /delete/_id
// @desc    delete specified number
// @access  Private
router.delete('/delete/:_id', auth, async (req, res) => {
  try {
    const { _id } = req.params;
    if (!!_id) {
      const result = await NumberItem.remove({ _id });
      res.json({ result: { _id } });
    } else {
      res.json({
        error: 'No match found!',
      });
    }
    const result = await NumberItem.find({});
    res.json({ result });
  } catch (err) {
    res.json({
      error: 'Something Happened, contact support!',
      content: err,
    });
  }
});

// @route   POST /
// @desc    add number to the pool
// @access  Private
router.post('/add', auth, async (req, res) => {
  const { number, order, available } = req.body;

  try {
    if (
      !!number &&
      number.toString().length > 9 &&
      !isNaN(number) &&
      !!order &&
      !isNaN(order) &&
      typeof available === 'boolean'
    ) {
      const found = await NumberItem.findOne({ _id: number });

      if (!!found) {
        res.json({
          error: 'Number already exists on the pool, keep swimming!',
        });
      } else {
        const num = new NumberItem({
          _id: number,
          order,
          available,
          count: 0,
          timestamp: new Date(),
        });
        num.save();
        res.json({
          msg: 'success',
          result: num,
        });
      }
    } else {
      res.json({
        error: 'Wrong Format!',
      });
    }
  } catch (err) {
    res.json({
      error: 'Something happened, contact support!',
      content: err,
    });
  }
});

// @route   POST /edit
// @desc    edit number
// @access  Private
router.post('/edit', auth, async (req, res) => {
  const { number, order, available, count } = req.body;

  try {
    if (
      !!number &&
      number.toString().length > 9 &&
      !isNaN(number) &&
      !!order &&
      typeof available === 'boolean'
    ) {
      const found = await NumberItem.findOne({ _id: number });

      if (!!found) {
        found._id = number;
        found.order = order === 0 || !!order ? order : found.order;
        found.available = available;
        found.count = count === 0 || !!count ? count : found.count;
        found.timestamp = new Date();

        await found.save();

        res.json({
          msg: 'success',
          result: found,
        });
      } else {
        res.json({
          error: 'Record does not exists!',
        });
      }
    } else {
      res.json({
        error: 'Wrong Format!',
      });
    }
  } catch (err) {
    res.json({
      error: 'Something happened, contact support!',
      content: err,
    });
  }
});

module.exports = router;
