const express = require("express");
const router = express.Router();
//const auth = require("../middleware/auth");

const workerActivityEvent = require("../models/WorkerActivityEvent");

// @route   GET api/workerActivityEvent
// @desc    Get all workerActivityEvents
// @access  Protected
router.get(
  "/:WorkerName",
  // auth,
  async (req, res) => {
    try {
      const { WorkerName } = req.params;
      const workerActivity = await workerActivityEvent.find({
        WorkerName: WorkerName,
        createdAt: {
          $gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            8,
            0
          ),
        },
      });
      res.json(workerActivity);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error...");
    }
  }
);

router.post(
  "/",
  // auth,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      const workerActivity = await workerActivityEvent.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      res.json(workerActivity);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error...");
    }
  }
);
module.exports = router;
