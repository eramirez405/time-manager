const express = require("express");
const router = express.Router();
const config = require("config");
const differenceInSeconds = require("date-fns/differenceInSeconds");
const auth = require("../middleware/auth");
const fetch = require("node-fetch");
const validatePhoneNumber = require('validate-phone-number-node-js');

//Config constants
const accountSid = config.get("TWILIO_ACCOUNT_SID");
const authToken = config.get("TWILIO_AUTH_TOKEN");
const workFlowChat = config.get("WORKFLOW_CHAT");
const workFlowPromoter = config.get("WORKFLOW_PROMOTER");
const serviceFlexChatService = config.get("SERVICE_FLEX_CHAT_SERVICE");
const servicePromoters = config.get("SERVICE_PROMOTERS");
const workspaceUalett = config.get("WORKSPACE_UALETT");
const webhookBackoffice = config.get("WEBHOOK_BACKOFFICE");

const client = require("twilio")(accountSid, authToken);

const Task = require("../models/Task");
const Event = require("../models/Event");
const WorkerActivityEvent = require("../models/WorkerActivityEvent");
const Worker = require("../models/Worker");
const Reservation = require("../models/Reservations");
const AuthUser = require("../models/AuthUser");
const CallBack = require("../models/callback");
const FlowCounter = require("../models/FlowCounter");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// @route   GET api/twilio/flowCounter
// @desc    Keeps track of how many clients have passed through the twilio flow (Julia chat)
// @access  Private
router.get("/flowCounter", async (req, res) => {
  try {
    const checkFlowNumber = async () => {
      //Check if the collection is empty
      const initialCount = await FlowCounter.find().countDocuments();
      //If empty, adds the first client/document
      if (initialCount === 0) {
        let flowNumber = 1;
        const clientData = new FlowCounter({ flowNumber });
        await clientData.save();

        const result = false;
        return result;
      } else if (initialCount !== 0) {
        //Check last client and get its flowNumber
        const lastClient = await FlowCounter.find().limit(1);
        const lastFlowNumber = lastClient[0].flowNumber;

        //Adds a new flowNumber based on the last + 1
        const flowNumber = lastFlowNumber + 1;
        await FlowCounter.findOneAndUpdate({}, { flowNumber });

        //Checks if its multiple of 10 by checking if the remainder is 0
        result = flowNumber % 10 === 0 ? true : false;

        return result;
      }
    };

    //Is this client a 10th?
    const is10thClient = await checkFlowNumber();

    //Sends the response
    res.json(is10thClient);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/twilio/callsLogs
// @desc    Get call logs
// @access  Private
router.post("/callsLogs", auth, async (req, res) => {
  try {
    const { startDate, endDate, status, fromNumber } = req.body;
    const result = await client.calls.list({
      limit: 60,
      ...(!!startDate ? { startTimeAfter: new Date(startDate) } : null),
      ...(!!endDate ? { startTimeBefore: new Date(endDate) } : null),
      ...(!!status ? { status: status.value } : null),
      ...(!!fromNumber ? { from: fromNumber } : null),
    });

    const recordingResult = await client.recordings.list({
      limit: 60,
      ...(!!startDate ? { dateCreatedAfter: new Date(startDate) } : null),
      ...(!!endDate ? { dateCreatedBefore: new Date(endDate) } : null),
      // ...(!!fromNumber ? { from: fromNumber } : null),
    });

    const processed = result.map((e) => {
      recordingResult.forEach((i) => {
        if (e.sid === i.callSid) {
          e.recordingSid = i.sid;
        }
      });

      return e;
    });

    if (processed) {
      res.json({ result: processed });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/callbacks
// @access  Private
router.get("/callback", async (req, res) => {
  try {
    const callback = await CallBack.find();
    res.json({
      callback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/callback/:startdate/:enddate
// @access  Private
router.get("/callback/:startdate/:enddate", async (req, res) => {
  try {
    const startDate = req.params.startdate;
    const endDate = req.params.enddate;
    const callback = await CallBack.find({
      requestTime: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    }).sort({ assignationTime: -1 });
    res.json({
      callback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/twilio/callback/:id
// @access  Private
router.put("/callback/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const callback = await CallBack.findById(id);
    if (!callback) {
      return res.json({ msg: "no found" });
    } else {
      const updateCallback = {
        ...req.body,
        callback: id,
      };
      const newCallBack = await CallBack.findByIdAndUpdate(id, updateCallback, {
        new: true,
      });
      return res.json({ callback: newCallBack });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/twilio/createCallback
// @access  Private
router.post("/createCallback", async (req, res) => {
  try {
    const { secret } = req.headers;

    if (secret === "3POl2LMryFZyuAotME8EfvCEgZgDOrkz") {
      try {
        const { name, text, phone, callerID } = req.body;
        if(!validatePhoneNumber.validate(phone)){
         res.status(400).send("invalid number");
         return;
        }
        req.body.requestTime = new Date();
        const callback = new CallBack(req.body);
        await callback.save();
        var io = req.app.get("socketio");
        io.emit("call", callback);
        res.status(200).send("callback created");
      } catch (error) {
        res.status(400).send("fields are missing in the callback");
      }
    } else {
      throw new Error("No authorized!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// @route   POST api/twilio/callback
// @desc    asignar callback
// @access  Private
router.post("/callback", async (req, res) => {
  const { name, text, phone, email, tag, language } = req.body;

  try {
    client.taskrouter.workspaces(workspaceUalett).tasks.create({
      attributes: JSON.stringify({
        taskType: "callback", //The type of task requested
        to: phone, //Call the client to this number
        from: phone,
        tag: tag, // Callback tag
        name: name, //Name of the client to callback
        sentFromElizabeth: true, //If it was sent from Julia's
        language: language,
        email: email, //Ualett's agent email
        reason: text, //Info given by the client about the callback
        direction: "inbound/chat",
        callTime: {
          server_time_short: new Date(), //Time when the callback was requested
        },
        placeCallRetry: 1, //Value for the requeue - Pending research
      }),
      taskChannel: "callback", //taskChannel - pending research
      type: "callback",
      workflowSid: "WW9e5aa7d99fdd956de85c0db755c07f6d", //workflow for the callback
    });

    res.status(201).send("Succesful request.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/twilio/callRecordings
// @desc    Get call recordings
// @access  Private
router.post("/callRecordings", auth, async (req, res) => {
  try {
    const { callSid } = req.body;
    const result = await client.recordings.list({ callSid });

    if (result) {
      res.json({ result });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/callDetails/:callSid
// @desc    Get call details
// @access  Private
router.get("/callEvents/:callSid", auth, async (req, res) => {
  try {
    const { callSid } = req.params;

    const result = await client.calls(callSid).events.list();

    if (result) {
      res.json({ result });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/twilio/tasksLogs
// @desc    Get task logs
// @access  Private
router.post("/tasksLogs", auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      direction,
      fromNumber,
      toNumber,
      worker,
      channel,
      name,
    } = req.body;

    const user = req.user;

    //Data with the members of the same department as the user logged in.
    const DepartmentMembers = await AuthUser.find({
      department: {
        $regex: `${user.department}`, //user.department,
        $options: "i",
      },
    }).exec();

    //Making a list with only the emails from the DepartmentMembers data
    const MemberList = DepartmentMembers.map((e) => e.email);

    const result = await Task.aggregate([
      {
        $match: {
          dateCreated: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          ...(user.role === "lead"
            ? {
                $or: [
                  { workerName: { $in: MemberList } },
                  { "reservations.workerName": { $in: MemberList } },
                ],
              }
            : !!worker
            ? {
                reservations: {
                  $exists: true,
                },
                "reservations.workerName": { $regex: worker, $options: "i" },
              }
            : null),
          ...(!!direction ? { "attributes.direction": direction } : null),
          ...(!!fromNumber
            ? { "attributes.from": { $regex: fromNumber } }
            : null),
          ...(!!toNumber
            ? { "attributes.outbound_to": { $regex: toNumber } }
            : null),
          ...(!!channel ? { taskChannelUniqueName: channel } : null),
          ...(!!name
            ? {
                $or: [
                  { "attributes.Link": { $regex: name, $options: "i" } },
                  { "attributes.name": { $regex: name, $options: "i" } },
                ],
              }
            : null),
        },
      },
      {
        $match: {
          ...(!!worker
            ? { "reservations.workerName": { $regex: worker, $options: "i" } }
            : null),
        },
      },
    ]).exec();

    if (result) {
      res.json({ result });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/workers
// @desc    Get workers logs
// @access  Private
router.get("/workers", auth, async (req, res) => {
  try {
    const result = await client.taskrouter
      .workspaces(workspaceUalett)
      .workers.list();

    if (result) {
      await asyncForEach(result, async (e) => {
        const found2 = await Worker.findOne({ sid: e.sid });
        if (!!!found2) {
          worker = new Worker(e);
          await worker.save();
        } else {
          if (
            found2.dateStatusChanged.getTime() !==
              e.dateStatusChanged.getTime() ||
            found2.available !== e.available ||
            found2.attributes !== e.attributes ||
            found2.activityName !== e.activityName
          ) {
            await Worker.findOneAndUpdate(
              { sid: e.sid },
              {
                $set: {
                  dateStatusChanged: e.dateStatusChanged,
                  available: e.available,
                  attributes: e.attributes,
                  activityName: e.activityName,
                },
              }
            );
          }
        }
      });
      const result2 = await Worker.find({});
      res.json({ result: result2 });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/twilio/workers/delete/:id
// @desc    Deletes a worker
// @access  Private
router.delete(
  "/workers/delete/:id",
  // auth,
  async (req, res) => {
    try {

      const { id } = req.params;

      await client.taskrouter.workspaces(workspaceUalett).workers(id).remove();

      await Worker.deleteOne({ sid: id });

      res.send("GG");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/eventUpdate", async (req, res) => {
try {
  
    const result = req.body;
    const result2 = await Task.updateOne({sid: result.sid}, 
    {
      $set: 
      {
        callReason: result.callReason
      }
    })

    if (result2) {
      res.status(200).send("worked");
    } else {
      res.status(500).send("Server Error");
    }
  
} catch (error) {
  console.error(error);
  res.status(500).send(error);
}
})

router.post("/hangUpUpdate", async (req, res) => {
  try {
      const result = req.body;
      const result2 = await Task.updateOne({sid: result.sid}, 
      {
        $set: 
        {
          hangUp: result.hangUp
        }
      })
      if (result2) {
        res.status(200).send("worked");
      } else {
        res.status(500).send("Server Error");
      }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
})

// @route   POST api/twilio/eventsReport
// @desc    Save events
// @access  Public
router.post("/eventsReport", async (req, res) => {
  try {
    const result = req.body;

    const found2 = await Event.findOne({ Sid: result.Sid });
    if (!!!found2) {
      event1 = new Event(result);
      await event1.save();

      switch (result.EventType) {
        case "task.created":
          const found3 = await Task.findOne({ sid: result.ResourceSid });
          if (!!!found3) {
            const _task = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .fetch();

            const _reservations = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .reservations.list();

            const attributes = IsJsonString(_task.attributes)
              ? JSON.parse(_task.attributes)
              : null;

            if (
              attributes.ignoreAgent &&
              attributes.conversations.conversation_id
            ) {
              const ID = attributes.conversations.conversation_id;

              const getLastTaskBD = async (sid) => {
                const result = await Task.findOne({ sid: sid });

                return result;
              };

              const getAtributesLastTask = (task) => {
                let result2 = {};
                result2.dateCreated = task.dateCreated;
                result2.reservations = [
                  ...task.reservations.map((e) => {
                    if (
                      e.reservationStatus === "completed" ||
                      e.reservationStatus === "pending"
                    ) {
                      e.reservationStatus = "transferred";
                    }
                    return e;
                  }),
                  ..._reservations
                    .map((e) => {
                      e.age = differenceInSeconds(e.dateUpdated, e.dateCreated);
                      return e;
                    })
                    .filter((e) => e !== null),
                ];

                return result2;
              };

              const createChat = async (reservationLastTask, date) => {
                task = new Task(_task);
                (task.reservations = reservationLastTask
                  ? reservationLastTask
                  : _reservations.map((e) => {
                      e.age = differenceInSeconds(e.dateUpdated, e.dateCreated);
                      return e;
                    })),
                  (task.dateCreated = date);

                task.attributes = IsJsonString(_task.attributes)
                  ? JSON.parse(_task.attributes)
                  : null;
                await task.save();
              };

              setTimeout(async () => {
                const lastTask = await getLastTaskBD(ID);
                if (lastTask) {
                  const { reservations, dateCreated } = getAtributesLastTask(
                    lastTask
                  );
                  createChat(reservations, dateCreated);
                }
              }, 50000);

              return;
            }

            task = new Task(_task);
            task.reservations = _reservations.map((e) => {
              e.age = differenceInSeconds(e.dateUpdated, e.dateCreated);
              return e;
            });
            task.attributes = IsJsonString(_task.attributes)
              ? JSON.parse(_task.attributes)
              : null;
            await task.save();

            try {
              // send to Backoffice
              // await fetch("http://localhost:3030/webhooks/twilio/voice", {
              await fetch(webhookBackoffice, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  EventType: result.EventType,
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskAttributes: IsJsonString(_task.attributes)
                    ? JSON.parse(_task.attributes)
                    : null,
                }),
              });
            } catch (err) {
              console.error(err);
            }
          }
          break;
        case "task.completed":
          setTimeout(async () => {
            const _reservations = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .reservations.list();

            const _task = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .fetch();

            const attributes = IsJsonString(_task.attributes)
              ? JSON.parse(_task.attributes)
              : null;

            if (
              !!_task &&
              _task.taskChannelUniqueName === "voice" &&
              !!attributes &&
              !!attributes.callbackID
            ) {
              const update = await Task.updateOne(
                { sid: attributes.callbackID },
                {
                  $set: {
                    "attributes.contacted": true,
                  },
                }
              );
            }

            const updateTask = async ({
              id,
              task,
              reservationLastTask,
              dateCreatedLastTask,
              callback,
              chatTransfer,
              age,
            }) => {
              if (!!_reservations) {
                await Task.updateOne(
                  {
                    sid: id,
                  },
                  {
                    $set: {
                      ...(!!callback || chatTransfer ? {} : task),
                      ...(dateCreatedLastTask
                        ? { dateCreated: dateCreatedLastTask }
                        : {}),
                      ...(age ? { age: age } : {}),
                      workerName: result.WorkerName,
                      reservations: reservationLastTask
                        ? [
                            ...reservationLastTask,
                            ..._reservations
                              .map((e) => {
                                e.age = differenceInSeconds(
                                  e.dateUpdated,
                                  e.dateCreated
                                );
                                return e;
                              })
                              .filter((e) => e !== null),
                            ,
                          ]
                        : _reservations.map((e) => {
                            e.age = differenceInSeconds(
                              e.dateUpdated,
                              e.dateCreated
                            );
                            return e;
                          }),
                      ...(callback ? { assignmentStatus: "completed" } : {}),
                      ...(callback || chatTransfer
                        ? {}
                        : IsJsonString(task.attributes)
                        ? { attributes: JSON.parse(task.attributes) }
                        : {}),
                    },
                  }
                );
                await asyncForEach(_reservations, async (e) => {
                  const found3 = await Reservation.findOne({ sid: e.sid });
                  if (!!!found3) {
                    e.age = differenceInSeconds(e.dateUpdated, e.dateCreated);
                    reservation = new Reservation(e);
                    await reservation.save();
                  }
                });
              } else {
                await Task.updateOne(
                  { sid: id },
                  {
                    $set: {
                      ...(!!callback || chatTransfer ? {} : task),
                      ...(dateCreatedLastTask
                        ? { dateCreated: dateCreatedLastTask }
                        : {}),
                      ...(reservationLastTask
                        ? {
                            reservations: [task.reservations],
                          }
                        : {}),
                      workerName: result.WorkerName,
                      ...(callback ? { assignmentStatus: "completed" } : {}),
                      ...(callback || chatTransfer
                        ? {}
                        : IsJsonString(task.attributes)
                        ? { attributes: JSON.parse(task.attributes) }
                        : {}),
                    },
                  }
                );
              }
            };

            if (!!_task && _task.taskChannelUniqueName === "callback") {
              updateTask({
                id: result.ResourceSid,
                task: _task,
                callback: true,
              });

              return;
            }

            //update transfered chat
            if (
              attributes.ignoreAgent &&
              attributes.conversations.conversation_id
            ) {
              const ID = attributes.conversations.conversation_id;

              const getLastTaskBD = async (sid) => {
                const result = await Task.findOne({ sid: sid });

                return result;
              };

              const lastTask = await getLastTaskBD(ID);

              const getAtributesLastTask = (task) => {
                let result2 = {};
                result2.dateCreated = task.dateCreated;
                result2.reservations = task.reservations.map((e) => {
                  if (
                    e.reservationStatus === "completed" ||
                    e.reservationStatus === "pending"
                  ) {
                    e.reservationStatus = "transferred";
                  }
                  return e;
                });

                return result2;
              };

              const updateLastTask = async (id, res, age) => {
                await Task.updateOne(
                  { sid: id },
                  {
                    $set: {
                      age: age,
                      reservations: [
                        ...res,
                        ..._reservations
                          .map((e) => {
                            e.age = differenceInSeconds(
                              e.dateUpdated,
                              e.dateCreated
                            );
                            return e;
                          })
                          .filter((e) => e !== null),
                      ],
                    },
                  }
                );
              };

              if (lastTask) {
                const { reservations, dateCreated } = getAtributesLastTask(
                  lastTask
                );

                const age1 =
                  lastTask.age !== null && lastTask.age !== undefined
                    ? Number(lastTask.age)
                    : 0;

                const age2 =
                  _task.age !== null && _task.age !== undefined
                    ? Number(_task.age)
                    : 0;

                function sum(a, b) {
                  return a + b;
                }

                updateTask({
                  id: result.ResourceSid,
                  task: _task,
                  reservationLastTask: reservations,
                  dateCreatedLastTask: dateCreated,
                  age: sum(age1, age2),
                });
                updateLastTask(ID, reservations, sum(age1, age2));
              }

              return;
            }

            updateTask({ id: result.ResourceSid, task: _task });

            try {
              // send to Backoffice
              // await fetch("http://localhost:3030/webhooks/twilio/voice", {
              await fetch(webhookBackoffice, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  EventType: result.EventType,
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskAttributes: IsJsonString(_task.attributes)
                    ? JSON.parse(_task.attributes)
                    : null,
                  dateCreated: _task.dateCreated,
                  WorkerName: result.WorkerName,
                  duration: _task.age,
                }),
              });
            } catch (err) {
              console.error(err);
            }
          }, 20000);
          break;
        case "task.canceled":
          setTimeout(async () => {
            const _reservations = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .reservations.list();

            const _task = await client.taskrouter
              .workspaces(workspaceUalett)
              .tasks(result.ResourceSid)
              .fetch();

            const attributes = IsJsonString(_task.attributes)
              ? JSON.parse(_task.attributes)
              : null;

            const updateTask = async (
              id,
              task,
              reservationLastTask,
              dateCreatedLastTask
            ) => {
              if (!!_reservations) {
                await Task.updateOne(
                  { sid: id },
                  {
                    $set: {
                      ...task,
                      ...(dateCreatedLastTask
                        ? { dateCreated: dateCreatedLastTask }
                        : {}),
                      workerName: result.WorkerName,
                      reservations: reservationLastTask
                        ? [
                            ...reservationLastTask,
                            ..._reservations
                              .map((e) => {
                                e.age = differenceInSeconds(
                                  e.dateUpdated,
                                  e.dateCreated
                                );
                                return e;
                              })
                              .filter((e) => e !== null),
                            ,
                          ]
                        : _reservations.map((e) => {
                            e.age = differenceInSeconds(
                              e.dateUpdated,
                              e.dateCreated
                            );
                            return e;
                          }),
                      ...(IsJsonString(task.attributes)
                        ? { attributes: JSON.parse(task.attributes) }
                        : {}),
                    },
                  }
                );
                await asyncForEach(_reservations, async (e) => {
                  const found3 = await Reservation.findOne({ sid: e.sid });
                  if (!!!found3) {
                    e.age = differenceInSeconds(e.dateUpdated, e.dateCreated);
                    reservation = new Reservation(e);
                    await reservation.save();
                  }
                });
              } else {
                await Task.updateOne(
                  { sid: result.ResourceSid },
                  {
                    $set: {
                      ...task,
                      ...(dateCreatedLastTask
                        ? { dateCreated: dateCreatedLastTask }
                        : {}),
                      ...(reservationLastTask
                        ? {
                            reservations: [
                              ...reservationLastTask,
                              ...task.reservations,
                            ],
                          }
                        : {}),
                      workerName: result.WorkerName,
                      ...(IsJsonString(task.attributes)
                        ? { attributes: JSON.parse(task.attributes) }
                        : {}),
                    },
                  }
                );
              }
            };

            updateTask(result.ResourceSid, _task);

            try {
              // send to Backoffice
              // await fetch("http://localhost:3030/webhooks/twilio/voice", {
              await fetch(webhookBackoffice, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  EventType: result.EventType,
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskAttributes: IsJsonString(_task.attributes)
                    ? JSON.parse(_task.attributes)
                    : null,
                  dateCreated: _task.dateCreated,
                  WorkerName: !!_reservations.length
                    ? _reservations[0].workerName
                    : null,
                  duration: _task.age,
                }),
              });
            } catch (err) {
              console.error(err);
            }
          }, 20000);
          break;
        case "reservation.rejected":
          await Worker.findOneAndUpdate(
            { sid: result.WorkerSid },
            {
              $push: {
                rejections: {
                  Timestamp: new Date(Number(result.TimestampMs)),
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskQueueName: result.TaskQueueName,
                  WorkerActivityName: result.WorkerActivityName,
                  ResourceSid: result.ResourceSid,
                },
              },
            }
          );
          break;
        case "reservation.timeout":
          await Worker.findOneAndUpdate(
            { sid: result.WorkerSid },
            {
              $push: {
                timeouts: {
                  Timestamp: new Date(Number(result.TimestampMs)),
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskQueueName: result.TaskQueueName,
                  ResourceSid: result.ResourceSid,
                },
              },
            }
          );
          break;
        case "reservation.accepted":
          await Worker.findOneAndUpdate(
            { sid: result.WorkerSid },
            {
              $set: {
                currentCall: {
                  Timestamp: new Date(Number(result.TimestampMs)),
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskQueueName: result.TaskQueueName,
                  ResourceSid: result.ResourceSid,
                },
                lastCall: false,
              },
            }
          );
          break;
        case "reservation.completed":
          await Worker.findOneAndUpdate(
            { sid: result.WorkerSid },
            {
              $set: {
                lastCall: {
                  Timestamp: new Date(Number(result.TimestampMs)),
                  TaskChannelUniqueName: result.TaskChannelUniqueName,
                  TaskQueueName: result.TaskQueueName,
                  ResourceSid: result.ResourceSid,
                },
                currentCall: false,
              },
            }
          );
          break;
        case "worker.activity.update":
          workerActivity = new WorkerActivityEvent(result);
          await workerActivity.save();
          await Worker.findOneAndUpdate(
            { sid: result.WorkerSid },
            {
              $set: {
                statusChangeInfo: {
                  Timestamp: new Date(Number(result.TimestampMs)),
                  WorkerActivityName: result.WorkerActivityName,
                  WorkerPreviousActivityName: result.WorkerPreviousActivityName,
                  WorkerTimeInPreviousActivity:
                    result.WorkerTimeInPreviousActivity,
                },
              },
            }
          );

          var io = req.app.get("socketio");

          io.emit("workerEvent", {
            EventType: result.EventType,
          });
          break;
        default:
          break;
      }
    }

    res.json({ msg: "Event saved" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/taskQueue
// @desc    Get task queue statics
// @access  Private
router.get("/taskQueue", auth, async (req, res) => {
  try {
    const result = await client.taskrouter
      .workspaces(workspaceUalett)
      .taskQueues.list();

    let taskQueueArray = [];

    await asyncForEach(result, async (e) => {
      const result2 = await client.taskrouter
        .workspaces(workspaceUalett)
        .taskQueues(e.sid)
        .realTimeStatistics()
        .fetch();

      const {
        activityStatistics,
        longestTaskWaitingAge,
        longestTaskWaitingSid,
        longestRelativeTaskAgeInQueue,
        longestRelativeTaskSidInQueue,
        tasksByStatus,
        totalAvailableWorkers,
        totalEligibleWorkers,
        totalTasks,
      } = result2;

      if (!!result2) {
        taskQueueArray.push({
          friendlyName: e.friendlyName,
          activityStatistics,
          longestTaskWaitingAge,
          longestTaskWaitingSid,
          longestRelativeTaskAgeInQueue,
          longestRelativeTaskSidInQueue,
          tasksByStatus,
          totalAvailableWorkers,
          totalEligibleWorkers,
          totalTasks,
        });
      }
    });

    // const result2 = await client.taskrouter
    //   .workspaces('WS22d6940179965c41c045fd3fe56a9c48')
    //   .taskQueues('WQ40cf7a8506235e85a51e882061c4f835')
    //   .realTimeStatistics()
    //   .fetch();

    if (!!taskQueueArray && taskQueueArray.length > 0) {
      res.json({ result: taskQueueArray });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/workSummary
// @desc    Get task queue statics
// @access  Private
router.post("/workSummary", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const result = await client.taskrouter
      .workspaces(workspaceUalett)
      .workers.statistics()
      .fetch({ startDate, endDate });

    const result2 = await Worker.find({});

    let logs = [];

    if (result2) {
      await asyncForEach(result2, async (e) => {
        const workerActivity = await client.taskrouter
          .workspaces(workspaceUalett)
          .workers(e.sid)
          .statistics()
          // .fetch({ minutes: 287 });
          .fetch({ startDate, endDate });

        let {
          cumulative: {
            reservations_created,
            reservations_accepted,
            reservations_rejected,
            reservations_timed_out,
            reservations_canceled,
            reservations_completed,
            activity_durations,
            start_time,
            end_time,
          },
        } = workerActivity;

        logs.push({
          reservations_created,
          reservations_accepted,
          reservations_rejected,
          reservations_timed_out,
          reservations_canceled,
          reservations_completed,
          activity_durations: activity_durations.sort((a, b) =>
            a.friendly_name > b.friendly_name ? 1 : -1
          ),
          start_time,
          end_time,
          friendlyName: e.friendlyName,
        });
      });
    }

    if (result) {
      res.json({ total: result, logs });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/twilio/recordingLogs
// @desc    Get recording logs
// @access  Private
router.post("/recordingLogs", auth, async (req, res) => {
  try {
    const { startDate, endDate, fromNumber } = req.body;
    const result = await client.recordings.list({
      limit: 60,
      ...(!!startDate ? { dateCreatedAfter: new Date(startDate) } : null),
      ...(!!endDate ? { dateCreatedBefore: new Date(endDate) } : null),
      // ...(!!fromNumber ? { from: fromNumber } : null),
    });

    if (result) {
      res.json({ result });
    } else {
      res.json({ result: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/twilio/chatMessages/:chatMessages
// @desc    Get recording logs
// @access  Private
router.get(
  "/workFlow/:workFlow/chatMessages/:chatMessages",
  // auth,
  async (req, res) => {
    const { workFlow, chatMessages } = req.params;
    let service;

    switch (workFlow) {
      case workFlowChat:
        // General chat
        service = serviceFlexChatService;
        break;
      case workFlowPromoter:
        // Promoters chat
        service = servicePromoters;
        break;

      default:
        service = serviceFlexChatService;
        break;
    }

    client.chat
      .services(service)
      .channels(chatMessages)
      .messages.list()
      .then((message) => res.send(message))
      .catch((err) => res.status(500).send(err));
  }
);

module.exports = router;
