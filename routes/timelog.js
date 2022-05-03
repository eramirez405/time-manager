const express = require("express");
const router = express.Router();
const startOfDay = require("date-fns/startOfDay");
const differenceInCalendarDays = require("date-fns/differenceInCalendarDays");
const addDays = require("date-fns/addDays");
const endOfDay = require("date-fns/endOfDay");
const {
  groupBy,
  processDayActivities,
  asyncForEach,
  processRangeActivities,

} = require("../utils");
const auth = require("../middleware/auth");
const startOfWeek = require("date-fns/startOfWeek");
const endOfWeek = require("date-fns/endOfWeek");
const startOfMonth = require("date-fns/startOfMonth");
const endOfMonth = require("date-fns/endOfMonth");
const format = require("date-fns/format");
const processWeeklyTimeReportTest = require("../utils/processWeeklyTimeReportTest");
const processMonthClokingReportTest = require("../utils/processMonthClokingReportTest");
const processDayCloking = require("../utils/processDayCloking");
const compareAsc = require("date-fns/compareAsc");
const isWithinInterval = require("date-fns/isWithinInterval");
const TimeLog = require("../models/TimeLog");
const AuthUser = require("../models/AuthUser");
const differenceInMinutes = require("date-fns/differenceInMinutes");
const isValid = require("date-fns/isValid");
const differenceInYears = require("date-fns/differenceInYears");
const sub = require("date-fns/sub");
const isToday = require("date-fns/isToday");
const isSameDay = require("date-fns/isSameDay");
// @route   POST /api/timelog
// @desc    add a time log
// @access  Private token secured
router.post("/", async (req, res) => {
  try {
    const { token } = req.headers;
    if (token === "timelog20210525secretToken") {
      const { user, activity, location } = req.body;

      const ip = req.clientIp;

      if (!!user && !!activity) {
        // Save the event
        let timelog = new TimeLog({
          user,
          activity,
          timestamp: new Date(),
          location,
          ip,
        });
        await timelog.save();
        //Insert socketIO code here
        var io = req.app.get("socketio");
        io.emit("statusActivity", {
          activity: activity,
          user: user,
        });

        res.send("Received");
      } else {
        throw "Missing params";
      }
    } else {
      res.send({ error: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/daySummary/:user
// @desc    Get the time summary for a user within current day
// @access  Private token secured
router.get("/daySummary/:user", async (req, res) => {
  try {
    const { user } = req.params;
    const { token } = req.headers;
    if (token === "timelog20210618secretToken") {
      if (user) {
        const result = await TimeLog.find(
          {
            user,
            timestamp: {
              $gt: startOfDay(new Date()),
            },
          },
          { activity: 1, timestamp: 1 }
        ).sort({ timestamp: 1 });

        if (!!result.length) {
          const processedActivities = await processDayActivities(result);
          res.json(processedActivities);
        } else {
          res.json({
            status: "fail",
            reason: "not found",
            message: "no activity for this user on current day",
          });
        }
      } else {
        throw new Error("No user received!");
      }
    } else {
      throw new Error("No authorized!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/daySummary
// @desc    Get the time summary for a all users within current day
// @access  Private token secured
router.get("/daySummary", async (req, res) => {
  try {
    const { token } = req.headers;
    if (token === "timelog20210618secretToken") {
      const users = await AuthUser.find({ timeManage: true });
      const result = await TimeLog.find(
        {
          timestamp: {
            $gt: startOfDay(new Date()),
          },
        },
        { activity: 1, timestamp: 1, user: 1 }
      ).sort({ timestamp: 1 });

      if (!!result.length) {
        const _usersArray = groupBy(result, (item) => item.user);

        let _resultArray = [];
        await asyncForEach(users, async (item) => {
          const { name, email, role, scheduleStart } = item;
          const processedUser = await processDayActivities(
            _usersArray.get(email),
            email,
            scheduleStart
          );
          _resultArray.push({ name, email, role, ...processedUser });
        });

        res.json(_resultArray);
      } else {
        res.json({
          status: "fail",
          reason: "not found",
          message: "no activity current day",
        });
      }
    } else {
      throw new Error("No authorized!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/workersLive
// @desc    Get the time summary for a all users within current day
// @access  Private token secured
router.get("/workersLive", async (req, res) => {
  try {
    const users = await AuthUser.find({ timeManage: true });
    const result = await TimeLog.aggregate(
      [
        {
          $sort: {
            timestamp: 1,
          },
        },
        {
          $lookup: {
            from: "authusers",
            localField: "user",
            foreignField: "email",
            as: "extra",
          },
        },
        {
          $unwind: {
            path: "$extra",
          },
        },
        {
          $project: {
            name: "$extra.name",
            email: "$extra.email",
            activity: 1,
            timestamp: 1,
            schedule: "$extra.schedule",
            scheduleStart: "$extra.scheduleStart",
            scheduleEnd: "$extra.scheduleEnd",
            timeManage: "$extra.timeManage",
            dailyNotes: "$extra.dailyNotes",
            poster: "$extra.dailyNotes.poster",
            sisNotes: "$extra.sisNotes",
          },
        },
        {
          $group: {
            _id: {
              email: "$email",
            },
            workerLive: {
              $last: "$$CURRENT",
            },
          },
        },
        //     {
        //     timestamp: {
        //       $gt: startOfDay(new Date()),
        //     },

        // }
        // },
        // {
        //   $match: {
        //     "workerLive.timestamp": {
        //       $gt: startOfDay(new Date()),
        //       //  $lt: new Date("Sat, 16 Oct 2021 12:55:46 GMT"),
        //     },
        //   },
        // },
      ]

      // { activity: 1, timestamp: 1, user: 1 }
    );

    if (!!result.length) {
      res.json(result);
      //console.log(result[0].workerLive.activity);
    } else {
      res.json({
        status: "fail",
        reason: "not found",
        message: "no activity current day",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/timeReport
// @desc    Get the time summary for a all users within current day
// @access  Private token secured
router.get("/timeReport/:startDate/:endDate", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const _startDate = new Date(startDate);
    const _endDate = new Date(endDate);
    if (differenceInCalendarDays(_endDate, _startDate) > 16) {
      throw new Error("Range Exceed!");
    }
    const users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });

      res.json(_resultArray);
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/report
// @desc    render timelog report
// @access  Private token secured
router.get("/report", async (req, res) => {
  try {
    const _startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const _endDate = endOfWeek(new Date(), { weekStartsOn: 6 });
    //     const _startDate = startOfWeek(sub(new Date(),{days:3,}), { weekStartsOn: 1 });
    // const _endDate = endOfWeek(sub(new Date(),{days:3,}), { weekStartsOn: 6 });
    const users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });

      const _data = _resultArray.map((e) => {
        //evaluacion de licencia y vacacaciones para imprimir
        // si tienen  en la proxima semana

        let licensesAndVacations = [];
        let nextweek = [];

        for (var i = 3; i < 8; i++) {
          nextweek.push(addDays(new Date(), i));
        }

        //aqui se evalua si en la semana siguiente hay licencia o vacacines.

        let validationLicense = isValid(new Date(e.licenseStart));
        let validationdifferenceInYears =
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            0 ||
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            1
            ? true
            : false;

        let isInTheRangeLincense =
          validationLicense == true &&
          validationdifferenceInYears == true &&
          e.licenseStart < e.licenseEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.licenseStart,
                  end: e.licenseEnd,
                })
              )
            : false;

        let validationVacation = isValid(new Date(e.vacationStart));
        let validationdifferenceInYearsVacations =
          differenceInYears(
            new Date(e.vacationEnd),
            new Date(e.vacationStart)
          ) == 0 ||
          differenceInYears(
            new Date(e.vacationEnd),
            new Date(e.vacationStart)
          ) == 1
            ? true
            : false;

        let isInTheRangeVacation =
          validationVacation == true &&
          validationdifferenceInYearsVacations == true &&
          e.vacationStart < e.vacationEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.vacationStart,
                  end: e.vacationEnd,
                })
              )
            : false;

        if (isInTheRangeLincense == true) {
          licensesAndVacations.push(
            `License Start:${format(
              new Date(e.licenseStart),
              "d/MM"
            )} -License End:${format(
              new Date(e.licenseEnd),
              "d/MM"
            )} - Reason:${e.licenseReason}`
          );
        } else if (isInTheRangeVacation == true) {
          licensesAndVacations.push(
            `VacationsStart:${format(
              new Date(e.vacationStart),
              "d/MM"
            )} -VacationsEnd:${format(
              new Date(e.vacationEnd),
              "d/MM"
            )} - Vacations`
          );
        }
        //end licensesAndVacation verification
        if (e.status === "success") {
          let workedHours = 0;
          let breakHours = 0;
          let awayHours = 0;
          let scheduleWorkedHours = 0;
          let idealScheduleWorkedHours = 0;
          let lateness = 0;
          let events = [];
          e.daysArray.forEach((item) => {
            if (item.clockInCounter)
              workedHours = workedHours + item.clockInCounter;
            if (item.inScheduleClockInCounter)
              scheduleWorkedHours =
                scheduleWorkedHours + item.inScheduleClockInCounter;
            if (item.idealScheduleTime)
              idealScheduleWorkedHours =
                idealScheduleWorkedHours + item.idealScheduleTime - 3600;
            if (item.clockedInLate) lateness = lateness + 1;
            if (item.breakCounter) breakHours = breakHours + item.breakCounter;
            if (item.awayCounter) awayHours = awayHours + item.awayCounter;

            //events check
            if (item.outRange) {
              events.push(
                `${format(new Date(item.startDate), "d/MM")} - ${item.outNote}`
              );
            } else {
              if (!item.clockedIn) {
                events.push(
                  `${format(
                    new Date(item.startDate),
                    "d/MM"
                  )} - Did not clockin this day`
                );
              }

              if (item.clockedIn && !item.clockedOut) {
                events.push(
                  `${format(
                    new Date(item.startDate),
                    "d/MM"
                  )} - Did not clockout this day`
                );
              }
              if (item.clockIncompleteAlert) {
                events.push(
                  `${format(new Date(item.startDate), "d/MM")} - ${
                    item.clockIncompleteAlert
                  }`
                );
              }
              if (item.Note != null) {
                item.Note.forEach((element) => {
                  if (!!element && !!element.note) {
                    let sendData = `${format(
                      new Date(element.timestamp),
                      "d/MM hh:mm aaaa"
                    )}- Note: ${element.note}`;

                    events.push(sendData);
                    // let result = events.filter((item, index) => {
                    //   return events.indexOf(item) === index;
                    // });
                  }
                });
              }
              if (item.IssueNote != null) {
                item.IssueNote.forEach((element) => {
                  if (!!element && !!element.noteSis) {
                    StartSisDate = new Date(
                      format(element.timestampSis, "M/d/y") +
                        " " +
                        element.startSis
                    );

                    EndSisDate = new Date(
                      format(element.timestampSis, "M/d/y") +
                        " " +
                        element.endSis
                    );
                    let sendData2 = `${format(
                      new Date(element.timestampSis),
                      "d/MM"
                    )} ${element.startSis}- NoteIssue: ${element.noteSis}
                    Duration:${differenceInMinutes(
                      new Date(EndSisDate),
                      new Date(StartSisDate)
                    )} MIN`;

                    events.push(sendData2);
                    // let result = events.filter((item, index) => {
                    //   return events.indexOf(item) === index;
                    // });
                  }
                });
              }
            }
          });
          const productivity = Math.round(
            ((scheduleWorkedHours - breakHours) / idealScheduleWorkedHours) *
              100
          );
          if (licensesAndVacations.length > 0) {
            // console.log(e);
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.schedule.monday.scheduleStart,
              scheduleEnd: e.schedule.monday.scheduleEnd,
              breakTime: e.schedule.monday.breakTime,
              workedHours: workedHours - breakHours,
              scheduleWorkedHours: scheduleWorkedHours - breakHours,
              idealScheduleWorkedHours: idealScheduleWorkedHours,
              attendance: e.daysWithActivities,
              _attendance: `${e.daysWithActivities} / ${e.rangeOfDays}`,
              _workedHours: `${Math.floor(
                (workedHours - breakHours) / 3600
              )}:${new Date((workedHours - breakHours) * 1000)
                .toISOString()
                .substr(14, 5)} --> ${Math.round(
                ((workedHours - breakHours) / idealScheduleWorkedHours) * 100
              )}%`,
              _scheduleWorkedHours: `${Math.floor(
                (scheduleWorkedHours - breakHours) / 3600
              )}:${new Date((scheduleWorkedHours - breakHours) * 1000)
                .toISOString()
                .substr(14, 5)} / ${Math.floor(
                idealScheduleWorkedHours / 3600
              )}:${new Date(idealScheduleWorkedHours * 1000)
                .toISOString()
                .substr(14, 5)} --> ${Math.round(
                ((scheduleWorkedHours - breakHours) /
                  idealScheduleWorkedHours) *
                  100
              )}%`,
              rowColor:
                productivity > 99
                  ? "table-primary"
                  : productivity > 60
                  ? "table-active"
                  : "table-danger",
              lateness,
              breakHours,
              avgBreakMin: `${Math.round(
                breakHours / e.daysWithActivities / 60
              )} min`,
              awayHours,
              avgAwayMin: `${Math.round(
                awayHours / e.daysWithActivities / 60
              )} min`,
              rangeOfDays: e.rangeOfDays,
              events: events.filter((item, index) => {
                return events.indexOf(item) === index;
              }),
              eventsCount: events.length,
              license: licensesAndVacations,
              licenseCount: licensesAndVacations.length,
            };
          } else {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.schedule.monday.scheduleStart,
              scheduleEnd: e.schedule.monday.scheduleEnd,
              breakTime: e.schedule.monday.breakTime,
              workedHours: workedHours - breakHours,
              scheduleWorkedHours: scheduleWorkedHours - breakHours,
              idealScheduleWorkedHours: idealScheduleWorkedHours,
              attendance: e.daysWithActivities,
              _attendance: `${e.daysWithActivities} / ${e.rangeOfDays}`,
              _workedHours: `${Math.floor(
                (workedHours - breakHours) / 3600
              )}:${new Date((workedHours - breakHours) * 1000)
                .toISOString()
                .substr(14, 5)} --> ${Math.round(
                ((workedHours - breakHours) / idealScheduleWorkedHours) * 100
              )}%`,
              _scheduleWorkedHours: `${Math.floor(
                (scheduleWorkedHours - breakHours) / 3600
              )}:${new Date((scheduleWorkedHours - breakHours) * 1000)
                .toISOString()
                .substr(14, 5)} / ${Math.floor(
                idealScheduleWorkedHours / 3600
              )}:${new Date(idealScheduleWorkedHours * 1000)
                .toISOString()
                .substr(14, 5)} --> ${Math.round(
                ((scheduleWorkedHours - breakHours) /
                  idealScheduleWorkedHours) *
                  100
              )}%`,
              rowColor:
                productivity > 99
                  ? "table-primary"
                  : productivity > 60
                  ? "table-active"
                  : "table-danger",
              lateness,
              breakHours,
              avgBreakMin: `${Math.round(
                breakHours / e.daysWithActivities / 60
              )} min`,
              awayHours,
              avgAwayMin: `${Math.round(
                awayHours / e.daysWithActivities / 60
              )} min`,
              rangeOfDays: e.rangeOfDays,
              events: events.filter((item, index) => {
                return events.indexOf(item) === index;
              }),
              eventsCount: events.length,
            };
          }
        } else {
          if (licensesAndVacations.length > 0) {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.schedule.monday.scheduleStart,
              scheduleEnd: e.schedule.monday.scheduleEnd,
              breakTime: e.schedule.monday.breakTime,
              license:
                licensesAndVacations.length > 0 ? licensesAndVacations : null,
              licenseCount: licensesAndVacations.length,
              error: e.message,
              events: [e.message],
              eventsCount: 1,
              rowColor: "table-danger",
            };
          } else {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.schedule.monday.scheduleStart,
              scheduleEnd: e.schedule.monday.scheduleEnd,
              breakTime: e.schedule.monday.breakTime,
              error: e.message,
              events: [e.message],
              eventsCount: 1,
              rowColor: "table-danger",
            };
          }
        }
      });

      // res.json(_data);
      res.render("index", {
        title: "Workers Time Report",
        data: _data,
        startDate: format(_startDate, "MMM d y"),
        endDate: format(_endDate, "MMM d y"),
      });
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/report/agents/[]
// @desc    render timelog report for specified agents
// @access  Private token secured
router.get("/report/agents/:agents", async (req, res) => {
  try {
    const { agents } = req.params;
    const _startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const _endDate = endOfWeek(new Date(), { weekStartsOn: 6 });
    const _users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const users = _users.filter((e) => agents.includes(e.email));

    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });

      const _data = _resultArray.map((e) => {
        //evaluacion de licencia y vacacaciones para imprimir
        // si tienen  en la proxima semana
        let licensesAndVacations = [];
        let nextweek = [];

        for (var i = 3; i < 8; i++) {
          nextweek.push(addDays(new Date(), i));
        }

        //aqui se evalua si en la semana siguiente hay licencia o vacacines.

        let validationLicense = isValid(new Date(e.licenseStart));
        let validationdifferenceInYears =
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            0 ||
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            1
            ? true
            : false;

        let isInTheRangeLincense =
          validationLicense == true &&
          validationdifferenceInYears == true &&
          e.licenseStart < e.licenseEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.licenseStart,
                  end: e.licenseEnd,
                })
              )
            : false;

        let validationVacation = isValid(new Date(e.vacationStart));
        let validationdifferenceInYearsVacations =
          differenceInYears(
            new Date(e.vacationEnd),
            new Date(e.vacationStart)
          ) == 0 ||
          differenceInYears(
            new Date(e.vacationStart),
            new Date(e.vacationEnd)
          ) == 1
            ? true
            : false;
        let isInTheRangeVacation =
          validationVacation == true &&
          validationdifferenceInYearsVacations == true &&
          e.vacationStart < e.vacationEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.vacationStart,
                  end: e.vacationEnd,
                })
              )
            : false;
        if (isInTheRangeLincense == true) {
          licensesAndVacations.push(
            `License Start:${format(
              new Date(e.licenseStart),
              "d/MM"
            )} -License End:${format(
              new Date(e.licenseEnd),
              "d/MM"
            )} - Reason:${e.licenseReason}`
          );
        } else if (isInTheRangeVacation == true) {
          licensesAndVacations.push(
            `VacationsStart:${format(
              new Date(e.vacationStart),
              "d/MM"
            )} -VacationsEnd:${format(
              new Date(e.vacationEnd),
              "d/MM"
            )} - Vacations`
          );
        }
        //end licensesAndVacation verification

        if (e.status === "success") {
          let workedHours = 0;
          let breakHours = 0;
          let awayHours = 0;
          let scheduleWorkedHours = 0;
          let idealScheduleWorkedHours = 0;
          let lateness = 0;
          let events = [];
          e.daysArray.forEach((item) => {
            if (item.clockInCounter)
              workedHours = workedHours + item.clockInCounter;
            if (item.inScheduleClockInCounter)
              scheduleWorkedHours =
                scheduleWorkedHours + item.inScheduleClockInCounter;
            if (item.idealScheduleTime)
              idealScheduleWorkedHours =
                idealScheduleWorkedHours + item.idealScheduleTime - 3600;
            if (item.clockedInLate) lateness = lateness + 1;
            if (item.breakCounter) breakHours = breakHours + item.breakCounter;
            if (item.awayCounter) awayHours = awayHours + item.awayCounter;

            //events check
            if (!item.clockedIn) {
              events.push(
                `${format(
                  new Date(item.startDate),
                  "d/MM"
                )} - Did not clockin this day`
              );
            }
            if (item.clockedIn && !item.clockedOut) {
              events.push(
                `${format(
                  new Date(item.startDate),
                  "d/MM"
                )} - Did not clockout this day`
              );
            }
            if (item.clockIncompleteAlert) {
              events.push(
                `${format(new Date(item.startDate), "d/MM")} - ${
                  item.clockIncompleteAlert
                }`
              );
            }

            if (item.Note != null) {
              item.Note.forEach((element) => {
                if (!!element && !!element.note) {
                  let sendData = `${format(
                    new Date(element.timestamp),
                    "d/MM hh:mm aaaa"
                  )}- Note: ${element.note}`;

                  events.push(sendData);
                }
              });
            }
            if (item.IssueNote != null) {
              item.IssueNote.forEach((element) => {
                if (!!element && !!element.noteSis) {
                  StartSisD = new Date(
                    format(element.timestampSis, "M/d/y") +
                      " " +
                      element.startSis
                  );

                  EndSisD = new Date(
                    format(element.timestampSis, "M/d/y") + " " + element.endSis
                  );
                  let sendData2 = `${format(
                    new Date(element.timestampSis),
                    "d/MM"
                  )} ${element.startSis}- NoteIssue: ${element.noteSis}
                    Duration:${differenceInMinutes(
                      new Date(EndSisD),
                      new Date(StartSisD)
                    )} MIN`;

                  events.push(sendData2);
                }
              });
            }
          });
          const productivity = Math.round(
            ((scheduleWorkedHours - breakHours) / idealScheduleWorkedHours) *
              100
          );

          return {
            id: e._id,
            name: e.name,
            department: e.department,
            scheduleStart: e.scheduleStart,
            scheduleEnd: e.scheduleEnd,
            breakTime: e.breakTime,
            workedHours: workedHours - breakHours,
            scheduleWorkedHours: scheduleWorkedHours - breakHours,
            idealScheduleWorkedHours: idealScheduleWorkedHours,
            attendance: e.daysWithActivities,
            _attendance: `${e.daysWithActivities} / ${e.rangeOfDays}`,
            _workedHours: `${Math.floor(
              (workedHours - breakHours) / 3600
            )}:${new Date((workedHours - breakHours) * 1000)
              .toISOString()
              .substr(14, 5)} --> ${Math.round(
              ((workedHours - breakHours) / idealScheduleWorkedHours) * 100
            )}%`,
            _scheduleWorkedHours: `${Math.floor(
              (scheduleWorkedHours - breakHours) / 3600
            )}:${new Date((scheduleWorkedHours - breakHours) * 1000)
              .toISOString()
              .substr(14, 5)} / ${Math.floor(
              idealScheduleWorkedHours / 3600
            )}:${new Date(idealScheduleWorkedHours * 1000)
              .toISOString()
              .substr(14, 5)} --> ${Math.round(
              ((scheduleWorkedHours - breakHours) / idealScheduleWorkedHours) *
                100
            )}%`,
            rowColor:
              productivity > 99
                ? "table-primary"
                : productivity > 60
                ? "table-active"
                : "table-danger",
            lateness,
            breakHours,
            avgBreakMin: `${Math.round(
              breakHours / e.daysWithActivities / 60
            )} min`,
            awayHours,
            avgAwayMin: `${Math.round(
              awayHours / e.daysWithActivities / 60
            )} min`,
            rangeOfDays: e.rangeOfDays,
            events: events.filter((item, index) => {
              return events.indexOf(item) === index;
            }),
            eventsCount: events.length,
            license: licensesAndVacations,
            licenseCount: licensesAndVacations.length,
          };
        } else {
          return {
            id: e._id,
            name: e.name,
            department: e.department,
            scheduleStart: e.scheduleStart,
            scheduleEnd: e.scheduleEnd,
            breakTime: e.breakTime,
            license: licensesAndVacations,
            licenseCount: licensesAndVacations.length,
            error: e.message,
            events: [e.message],
            eventsCount: 1,
            rowColor: "table-danger",
          };
        }
      });

      // res.json(_data);
      res.render("index", {
        title: "Workers Time Report",
        data: _data,
        startDate: format(_startDate, "MMM d y"),
        endDate: format(_endDate, "MMM d y"),
      });
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/report/agentsMonth/[]
// @desc    render timelog report for specified agents
// @access  Private token secured
router.get("/report/agentsMonth/:agents", async (req, res) => {
  try {
    const { agents } = req.params;
    const _startDate = startOfMonth(new Date(), { weekStartsOn: 1 });
    const _endDate = endOfMonth(new Date(), { weekStartsOn: 6 });
    // const _startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    // const _endDate = endOfWeek(new Date(), { weekStartsOn: 6 });
    const _users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const users = _users.filter((e) => agents.includes(e.email));

    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });

      const _data = _resultArray.map((e) => {
        if (e.status === "success") {
          let event = [];

          e.daysArray.forEach((item) => {
            let haveLicense =
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 1 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1) ||
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 0 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1);
            event.push({
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart:
                item.scheduleStart != undefined
                  ? format(new Date(item.scheduleStart), "hh:mm aaaa")
                  : "N/A",
              scheduleEnd:
                item.scheduleEnd != undefined
                  ? format(new Date(item.scheduleEnd), "hh:mm aaaa")
                  : "N/A",
              breakTime: item.break != undefined ? item.break : "N/A",
              day: item.day,
              date:
                item.firstCloking != undefined && item.firstCloking != "NA"
                  ? format(item.firstCloking, "d/M/y")
                  : "",
              firstCloking:
                item.firstCloking != undefined && item.firstCloking != "NA"
                  ? format(new Date(item.firstCloking), "hh:mm aaaa")
                  : undefined,
              Logout:
                item.Logout != undefined && item.Logout != "NA"
                  ? format(new Date(item.Logout), "hh:mm aaaa")
                  : undefined,
              clockedInLate: item.clockedInLate,
              license: haveLicense,
              licenseReason: e.licenseReason,
              licenseEnd: e.licenseEnd,
              licenseStart: e.licenseStart,
              rowColor:
                haveLicense == true
                  ? "table-success"
                  : item.clockedInLate == true
                  ? "table-warning"
                  : item.firstCloking == undefined
                  ? "table-danger"
                  : "table-primary",
            });
          });

          return event;
        } else {
          let haveLicense =
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 1 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1) ||
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 0 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1);
          return {
            id: e._id,
            name: e.name,
            department: e.department,
            scheduleStart: e.scheduleStart,
            scheduleEnd: e.scheduleEnd,
            breakTime: e.breakTime,

            rowColor: haveLicense == true ? "table-success" : "table-danger",
          };
        }
      });

      // res.json(_data);
      res.render("IndexMonth", {
        title: "Workers Time Report",
        data: _data.flat(),
        startDate: format(_startDate, "MMM d y"),
        endDate: format(_endDate, "MMM d y"),
      });
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});
// @route   GET /api/timelog/report/agentsMonth
// @desc    render timelog report for All Agents in a month
// @access  Private token secured
router.get("/report/reportagentsMonth", async (req, res) => {
  try {
    const _startDate = startOfMonth(sub(new Date(), { days: 3 }), {
      weekStartsOn: 1,
    });
    const _endDate = endOfMonth(sub(new Date(), { days: 3 }), {
      weekStartsOn: 6,
    });
    // const _startDate = startOfDay(new Date());
    // const _endDate = endOfDay(new Date());
    const users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });
      const _data = _resultArray.map((e) => {
        if (e.status === "success") {
          let event = [];

          e.daysArray.forEach((item) => {
            let haveLicense =
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 1 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1) ||
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 0 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1);
            if (e.email == e.email) {
              event.push({
                id: e._id,
                name: e.name,
                department: e.department,
                scheduleStart:
                  item.scheduleStart != undefined
                    ? format(new Date(item.scheduleStart), "hh:mm aaaa")
                    : "N/A",
                scheduleEnd:
                  item.scheduleEnd != undefined
                    ? format(new Date(item.scheduleEnd), "hh:mm aaaa")
                    : "N/A",
                breakTime: item.break != undefined ? item.break : "N/A",
                day: item.day,
                date:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "d/M/y")
                    : "",
                dayWeek:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "cccc")
                    : "",
                firstCloking:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(new Date(item.firstCloking), "hh:mm aaaa")
                    : undefined,
                Logout:
                  item.Logout != undefined && item.Logout != "NA"
                    ? format(new Date(item.Logout), "hh:mm aaaa")
                    : undefined,
                clockedInLate: item.clockedInLate,
                license: haveLicense,
                licenseReason: e.licenseReason,
                licenseEnd: e.licenseEnd,
                licenseStart: e.licenseStart,
                rowColor:
                  haveLicense == true
                    ? "table-success"
                    : item.clockedInLate == true
                    ? "table-warning"
                    : item.firstCloking == undefined
                    ? "table-danger"
                    : "table-primary",
              });
            }
          });

          return event;
        } else {
          let haveLicense =
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 1 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1) ||
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 0 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1);
          return [
            {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.scheduleStart,
              scheduleEnd: e.scheduleEnd,
              breakTime: e.breakTime,

              rowColor: haveLicense == true ? "table-success" : "table-danger",
            },
          ];
        }
      });

      res.render("IndexMonth", {
        title: "Workers Time Report",
        data: _data,
        startDate: format(_startDate, "MMM d y"),
        endDate: format(_endDate, "MMM d y"),
      });
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});
// @route   GET /api/timelog/report/dayReport
// @desc    render timelog report for the day cloking 
// @access  Private token secured
router.get("/report/dayReport", async (req, res) => {
  try {
    const _startDate = startOfDay(new Date());
    const _endDate = endOfDay(new Date());
 
    const users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });
      const _data = _resultArray.map((e) => {
       
        if (e.status === "success") {
          let event = [];

          e.daysArray.forEach((item) => {
             
             let haveNoteToday = item.Note.some(
              (element)=>isToday(new Date(element.timestamp))
            );
           
            let haveLicense =
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 1 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1) ||
              (compareAsc(
                new Date(item.scheduleStart),
                new Date(e.licenseStart)
              ) == 0 &&
                compareAsc(
                  new Date(item.scheduleEnd),
                  new Date(e.licenseEnd)
                ) == -1);
            if (e.email == e.email) {
              event.push({
                id: e._id,
                name: e.name,
                department: e.department,
                scheduleStart:
                  item.scheduleStart != undefined
                    ? format(new Date(item.scheduleStart), "hh:mm aaaa")
                    : "N/A",
                scheduleEnd:
                  item.scheduleEnd != undefined
                    ? format(new Date(item.scheduleEnd), "hh:mm aaaa")
                    : "N/A",
                breakTime: item.break != undefined ? item.break : "N/A",
                day: item.day,
                date:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "d/M/y")
                    : "",
                dayWeek:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "cccc")
                    : "",
                firstCloking:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(new Date(item.firstCloking), "hh:mm aaaa")
                    : undefined,
                Logout:
                  item.Logout != undefined && item.Logout != "NA"
                    ? format(new Date(item.Logout), "hh:mm aaaa")
                    : undefined,
                clockedInLate: item.clockedInLate,
                license: haveLicense,
                licenseReason: e.licenseReason,
                licenseEnd: e.licenseEnd,
                licenseStart: e.licenseStart,
                rowColor:
                  haveLicense == true
                    ? "table-warning"
                    : haveNoteToday  == true
                    ?  "table-warning"
                    :   item.clockedInLate == true
                    ? "table-danger"
                    : item.firstCloking == undefined ? "table-danger" : "table-primary",
              });
            }
          });

          return event;
        } else {
          // console.log("personas con licencia o out",e);
          let today = [];
          
          let haveLicense =
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 1 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1) ||
            (compareAsc(new Date(_startDate), new Date(e.licenseStart)) == 0 &&
              compareAsc(new Date(_endDate), new Date(e.licenseEnd)) == -1);
          let haveVacations =
            (compareAsc(new Date(_startDate), new Date(e.vacationStart)) == 1 &&
              compareAsc(new Date(_endDate), new Date(e.vacationEnd)) == -1) ||
            (compareAsc(new Date(_startDate), new Date(e.vacationStart)) == 0 &&
              compareAsc(new Date(_endDate), new Date(e.vacationEnd)) == -1);
             
              let haveLicenseToday= isToday( new Date(e.licenseEnd));
              let haveVacationsToday= isToday(  new Date(e.vacationEnd));
               
         let haveNoteToday = e.dailyNotes.some(
           (element)=>isToday(new Date(element.timestamp))
         );
        //  console.log(haveNoteToday)
        //  isToday(new Date(e.dailyNotes.timestampSis));
          return [
            {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.schedule.monday.scheduleStart != null ? e.schedule.monday.scheduleStart : "N/A",
              scheduleEnd: e.schedule.monday.scheduleEnd != null ? e.schedule.monday.scheduleEnd : "N/A",
              breakTime: e.schedule.monday.breakTime != null ? e.schedule.monday.breakTime :"N/A",

              rowColor:
                haveLicense == true
                  ? "table-warning"
                  : haveVacations == true
                  ? "table-warning"
                  :  haveLicenseToday ==true ?  "table-warning" : haveVacationsToday == true ? "table-warning":
                  haveNoteToday == true ? "table-warning"  : "table-danger",
            },
          ];
        }
      });

      res.render("IndexToday", {
        title: "Workers Time Report",
        data: _data,
        startDate: format(_startDate, "MMM d y"),
        endDate: format(_endDate, "MMM d y"),
      });
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});

// @route   GET /api/timelog/report/dayLogs
// @desc    render timelog report for All Agents in a month
// @access  Private token secured
router.get("/report/dayLogs", async (req, res) => {
  try {
    // const _startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    // const _endDate = endOfWeek(new Date(), { weekStartsOn: 6 });
    const _startDate = startOfDay(new Date());
    const _endDate = endOfDay(new Date());
    const users = await AuthUser.find(
      { timeManage: true },
      { password: 0, date: 0, timeManage: 0 }
    ).lean();
    const result = await TimeLog.find(
      {
        timestamp: {
          $gt: startOfDay(_startDate),
          $lte: endOfDay(addDays(_endDate, 1)),
        },
      },
      { activity: 1, timestamp: 1, user: 1 }
    )
      .sort({ timestamp: 1 })
      .lean();

    if (!!result.length) {
      const _usersArray = groupBy(result, (item) => item.user);

      let _resultArray = [];
      await asyncForEach(users, async (item) => {
        const { schedule } = item;

        if (schedule) {
          const processedUser = await processRangeActivities(
            _usersArray.get(item.email),
            _startDate,
            _endDate,
            item
          );

          _resultArray.push({
            ...item,
            ...processedUser,
          });
        } else {
          _resultArray.push({
            ...item,
            status: "fail",
            reason: "incomplete settings",
            message: "needs to fullfil his profile",
          });
        }
      });

      const _data = _resultArray.map((e) => {
        let event02 = [];

        //en esta parte se pondran las notas y las sisNotes

        let outNotes = [];
        if (e.dailyNotes != null) {
          e.dailyNotes.forEach((element) => {
            //validacion de que si las notas son de hoy
            let validationIsToday = isToday(new Date(element.timestamp));
            ////////
            if (!!element && !!element.note && validationIsToday == true) {
              let sendData = `${format(
                new Date(element.timestamp),
                "d/MM hh:mm aaaa"
              )}- Note: ${element.note}`;

              outNotes.push(sendData);
            }
          });
        }
        if (e.sisNotes != null) {
          e.sisNotes.forEach((element) => {
            //validacion de que si las notas son de hoy
            let validationIsToday = isToday(new Date(element.timestampSis));
            ////////
            if (!!element && !!element.noteSis && validationIsToday == true) {
              StartSisDate = new Date(
                format(element.timestampSis, "M/d/y") + " " + element.startSis
              );

              EndSisDate = new Date(
                format(element.timestampSis, "M/d/y") + " " + element.endSis
              );
              let sendData2 = `${format(
                new Date(element.timestampSis),
                "d/MM"
              )} ${element.startSis}- NoteIssue: ${element.noteSis}
              Duration:${differenceInMinutes(
                new Date(EndSisDate),
                new Date(StartSisDate)
              )} MIN`;

              outNotes.push(sendData2);
              // let result = events.filter((item, index) => {
              //   return events.indexOf(item) === index;
              // });
            }
          });
        }
        ///
        //evaluacion de licencia y vacacaciones para imprimir

        let licensesAndVacations = [];
        let nextweek = [];

        nextweek.push(new Date());

        //aqui se evalua si en la semana siguiente hay licencia o vacacines.

        let validationLicense = isValid(new Date(e.licenseStart));
        let validationdifferenceInYears =
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            0 ||
          differenceInYears(new Date(e.licenseEnd), new Date(e.licenseStart)) ==
            1
            ? true
            : false;

        let isInTheRangeLincense =
          validationLicense == true &&
          validationdifferenceInYears == true &&
          e.licenseStart < e.licenseEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.licenseStart,
                  end: e.licenseEnd,
                })
              )
            : false;

        let isInTheRangeLincensesSameDay =
          validationLicense == true &&
          validationdifferenceInYears == true &&
          isSameDay(e.licenseStart, e.licenseEnd) == true
            ? isSameDay(e.licenseStart, new Date())
            : false;

        let validationVacation = isValid(new Date(e.vacationStart));
        let validationdifferenceInYearsVacations =
          differenceInYears(
            new Date(e.vacationEnd),
            new Date(e.vacationStart)
          ) == 0 ||
          differenceInYears(
            new Date(e.vacationEnd),
            new Date(e.vacationStart)
          ) == 1
            ? true
            : false;

        let isInTheRangeVacation =
          validationVacation == true &&
          validationdifferenceInYearsVacations == true &&
          e.vacationStart < e.vacationEnd
            ? nextweek.some((element) =>
                isWithinInterval(element, {
                  start: e.vacationStart,
                  end: e.vacationEnd,
                })
              )
            : false;
        let isInTheRangeVacationSameDay =
          validationVacation == true &&
          validationdifferenceInYearsVacations == true &&
          isSameDay(e.vacationStart, e.vacationEnd) == true
            ? isSameDay(e.vacationStart, new Date())
            : false;
        if (
          isInTheRangeLincense == true ||
          isInTheRangeLincensesSameDay == true
        ) {
          licensesAndVacations.push(
            `${format(new Date(e.licenseStart), "d/MM")} -${format(
              new Date(e.licenseEnd),
              "d/MM"
            )} - Reason:${e.licenseReason}`
          );
        } else if (
          isInTheRangeVacation == true ||
          isInTheRangeVacationSameDay == true
        ) {
          licensesAndVacations.push(
            `${format(new Date(e.vacationStart), "d/MM")} -${format(
              new Date(e.vacationEnd),
              "d/MM"
            )} - Vacations`
          );
        }
        //end licensesAndVacation verification
        if (e.status === "success") {
          let workedHours = 0;
          let breakHours = 0;
          let awayHours = 0;
          let scheduleWorkedHours = 0;
          let idealScheduleWorkedHours = 0;
          let lateness = 0;
          let events = [];
          let eventsNotes = [];
          e.daysArray.forEach((item) => {
            //data extra para el calculo del bot
            if (e.email == e.email) {
              event02.push({
                id: e._id,
                name: e.name,
                department: e.department,
                scheduleStart:
                  item.scheduleStart != undefined
                    ? format(new Date(item.scheduleStart), "hh:mm aaaa")
                    : "N/A",
                scheduleEnd:
                  item.scheduleEnd != undefined
                    ? format(new Date(item.scheduleEnd), "hh:mm aaaa")
                    : "N/A",
                breakTime: item.break != undefined ? item.break : "N/A",
                day: item.day,
                date:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "d/M/y")
                    : "",
                dayWeek:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(item.firstCloking, "cccc")
                    : "",
                firstCloking:
                  item.firstCloking != undefined && item.firstCloking != "NA"
                    ? format(new Date(item.firstCloking), "hh:mm aaaa")
                    : undefined,
                Logout:
                  item.Logout != undefined && item.Logout != "NA"
                    ? format(new Date(item.Logout), "hh:mm aaaa")
                    : undefined,

                clockedInLate: item.clockedInLate,

                clockedIn: item.clockedIn,
                clockedOut: item.clockedOut,
                activities: item.activities.pop(),
              });
            }

            ///
            if (item.clockInCounter)
              workedHours = workedHours + item.clockInCounter;
            if (item.inScheduleClockInCounter)
              scheduleWorkedHours =
                scheduleWorkedHours + item.inScheduleClockInCounter;
            if (item.idealScheduleTime)
              idealScheduleWorkedHours =
                idealScheduleWorkedHours + item.idealScheduleTime - 3600;
            if (item.clockedInLate) lateness = lateness + 1;
            if (item.breakCounter) breakHours = breakHours + item.breakCounter;
            if (item.awayCounter) awayHours = awayHours + item.awayCounter;

            //events check
            if (item.outRange) {
              events.push(
                `${format(new Date(item.startDate), "d/MM")} - ${item.outNote}`
              );
            } else {
              if (!item.clockedIn) {
                events.push(
                  `${format(
                    new Date(item.startDate),
                    "d/MM"
                  )} - Did not clockin this day`
                );
              }

              if (item.clockedIn && !item.clockedOut) {
                events.push(
                  `${format(
                    new Date(item.startDate),
                    "d/MM"
                  )} - Did not clockout this day`
                );
              }
              if (item.clockIncompleteAlert) {
                events.push(
                  `${format(new Date(item.startDate), "d/MM")} - ${
                    item.clockIncompleteAlert
                  }`
                );
              }
              if (item.Note != null) {
                item.Note.forEach((element) => {
                  if (!!element && !!element.note) {
                    let sendData = `${format(
                      new Date(element.timestamp),
                      "d/MM hh:mm aaaa"
                    )}- Note: ${element.note}`;

                    eventsNotes.push(sendData);
                  }
                });
              }
              if (item.IssueNote != null) {
                item.IssueNote.forEach((element) => {
                  if (!!element && !!element.noteSis) {
                    StartSisDate = new Date(
                      format(element.timestampSis, "M/d/y") +
                        " " +
                        element.startSis
                    );

                    EndSisDate = new Date(
                      format(element.timestampSis, "M/d/y") +
                        " " +
                        element.endSis
                    );
                    let sendData2 = `${format(
                      new Date(element.timestampSis),
                      "d/MM"
                    )} ${element.startSis}- NoteIssue: ${element.noteSis}
                    Duration:${differenceInMinutes(
                      new Date(EndSisDate),
                      new Date(StartSisDate)
                    )} MIN`;

                    eventsNotes.push(sendData2);
                  }
                });
              }
            }
          });
          const productivity = Math.round(
            ((scheduleWorkedHours - breakHours) / idealScheduleWorkedHours) *
              100
          );
          if (licensesAndVacations.length > 0) {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              outNotes,

              rangeOfDays: e.rangeOfDays,
              events: events.filter((item, index) => {
                return events.indexOf(item) === index;
              }),
              event02,
              eventsNotes,
              eventsCount: events.length,
              license: licensesAndVacations,
              licenseCount: licensesAndVacations.length,
            };
          } else {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              outNotes,

              rangeOfDays: e.rangeOfDays,
              event02,
              eventsNotes,
              events: events.filter((item, index) => {
                return events.indexOf(item) === index;
              }),
              eventsCount: events.length,
            };
          }
        } else {
          if (licensesAndVacations.length > 0) {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.scheduleStart,
              scheduleEnd: e.scheduleEnd,
              breakTime: e.breakTime,
              license:
                licensesAndVacations.length > 0 ? licensesAndVacations : null,
              licenseCount: licensesAndVacations.length,
              outNotes,
              error: e.message,
              events: [e.message],
              eventsCount: 1,
              rowColor: "table-danger",
            };
          } else {
            return {
              id: e._id,
              name: e.name,
              department: e.department,
              scheduleStart: e.scheduleStart,
              scheduleEnd: e.scheduleEnd,
              breakTime: e.breakTime,
              error: e.message,
              events: [e.message],
              outNotes,
              eventsCount: 1,
              rowColor: "table-danger",
            };
          }
        }
      });

      let colcking = 0;
      let out = 0;
      let breakIng = 0;
      let vacationsOrLicenses = [];
      let OutNotesArr = [];
      let breakingPName = [];
      _data.forEach((e) => {
        let logs =
          e.event02 != undefined
            ? e.event02.map((u) => {
                if (
                  u.clockedIn == true &&
                  u.activities &&
                  u.activities.activity != "breakIn" &&
                  u.activities.activity != "clockout" &&
                  u.name != "Marlenee Sanz"
                ) {
                  colcking = colcking + 1;
                }

                if (
                  u.activities &&
                  u.activities.activity == "breakIn" &&
                  u.name != "Marlenee Sanz"
                ) {
                  breakIng = breakIng + 1;

                  breakingPName.push(`${u != 0 && "\n"}\t${u.name}`);
                }

                if (
                  u.clockedOut == true ||
                  (u.activities &&
                    u.activities.activity == "clockout" &&
                    u.name != "Marlenee Sanz")
                ) {
                  // console.log(u);
                  if (e.outNotes.length > 0) {
                    // console.log(u);
                    OutNotesArr.push(
                      `${u != 0 && "\n"}\t${u.name},${
                        e.outNotes[e.outNotes.length - 1]
                      }`
                    );

                    out = out + 1;
                  } else {
                    // console.log(u);
                    OutNotesArr.push(`${u != 0 && "\n"}\t${u.name}`);
                    out = out + 1;
                  }
                }

                return e.clockedIn;
              })
            : (out = e.name == "Marlenee Sanz" ? out : out + 1);

        if (
          e.outNotes.length > 0 &&
          e.event02 == undefined &&
          e.name != "Marlenee Sanz"
        ) {
          OutNotesArr.push(
            `${e != 0 && "\n"}\t${e.name},${e.outNotes[e.outNotes.length - 1]}`
          );
        } else if (
          e.outNotes.length == 0 &&
          e.licenseCount == undefined &&
          e.event02 == undefined &&
          e.name != "Marlenee Sanz"
        ) {
          OutNotesArr.push(`${e != 0 && "\n"}\t${e.name}`);
        }
        if (e.licenseCount > 0) {
          e.license.map((o) => {
            vacationsOrLicenses.push(`${o != 0 && "\n"}\t${e.name},${o}`);
          });
        }
      });

      let sentReport = {
        colcking,
        out,
        breakIng,
        vacationsOrLicenses,
        OutNotesArr,
        breakingPName,
        totalperson: _data.length,
      };

      //enviar la data para los bots
      const members = [
        392, //michael
        132, //boss
        5616, //SirJulay
        1090, //SirOscar
        // 132, //Erasmo
        // 20, //Ricky
        // 40, //Marlenee
        // 140, //Pamela,
        // 392, // Michael
        // 1398, // Luis Vidal
        // aqui se ponen las personas que les va a llegar las notas
      ];
      members.forEach((Id) => {
        var axios = require("axios");
        var data = JSON.stringify({
          USER_ID: Id,
          MESSAGE: `[B]CORTE DE COLABORADORES EN PLATAFORMA, HORA ${format(
            new Date(),
            "hh:mm aaaa"
          )} [/B]
     [B]Total de colaboradores[/B]: ${sentReport.totalperson}

     [B]WORKING[/B]: ${sentReport.colcking}------>${Math.round(
            (sentReport.colcking / sentReport.totalperson) * 100
          )}%
     [B]ON BREAK[/B]: ${sentReport.breakIng}------>${Math.round(
            (sentReport.breakIng / sentReport.totalperson) * 100
          )}%
     [B]OUT[/B]: ${sentReport.out}------>${Math.round(
            (sentReport.out / sentReport.totalperson) * 100
          )}%
     
     ${sentReport.OutNotesArr.length > 0 ? "[B] COLABORADORES OUT:[/B]" : ""}
     ${sentReport.OutNotesArr}

     ${
       sentReport.vacationsOrLicenses.length > 0
         ? "[B] COLABORADORES EN VACACIONES O LICENCIA:[/B]"
         : ""
     }
     ${sentReport.vacationsOrLicenses}
    
     ${
       sentReport.breakingPName.length > 0
         ? "[B] COLABORADORES ON BREAK:[/B]"
         : ""
     }
      ${sentReport.breakingPName}
     `,
        });

        var config = {
          method: "post",
          url:
            "https://ualett.bitrix24.com/rest/134/v5v48fs0pdz0npmt/im.message.add",
          headers: {
            "Content-Type": "application/json",
            Cookie: "BITRIX_SM_SALE_UID=0; qmb=.",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            //console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      });

      const sendDataForTelegram = async (sentReport) => {
        var axios = require("axios");
        var data = JSON.stringify({
          chatID: "-1001527642595",
          message: `CORTE DE COLABORADORES EN PLATAFORMA, HORA ${format(
            new Date(),
            "hh:mm aaaa"
          )}
       Total de colaboradores: ${sentReport.totalperson}
  
       WORKING: ${sentReport.colcking}------>${Math.round(
            (sentReport.colcking / sentReport.totalperson) * 100
          )}%
       ON BREAK: ${sentReport.breakIng}------>${Math.round(
            (sentReport.breakIng / sentReport.totalperson) * 100
          )}%
       OUT: ${sentReport.out}------>${Math.round(
            (sentReport.out / sentReport.totalperson) * 100
          )}%
       
       ${sentReport.OutNotesArr.length > 0 ? "COLABORADORES OUT:" : ""}
       ${sentReport.OutNotesArr}
        ${
          sentReport.vacationsOrLicenses.length > 0
            ? "COLABORADORES EN VACACIONES O LICENCIA:"
            : ""
        }
       ${sentReport.vacationsOrLicenses}
       ${sentReport.breakingPName.length > 0 ? "COLABORADORES ON BREAK:" : ""}
       ${sentReport.breakingPName}
       `,
        });

        var config = {
          method: "post",
          url: "http://167.71.251.120:4000/api/ualettBot/sendMessage",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            // console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      };

      const sendDataForGooglechat = async (sentReport) => {
        var axios = require("axios");

        var data = JSON.stringify({
          text: `*CORTE DE COLABORADORES EN PLATAFORMA*, *HORA* *${format(
            new Date(),
            "hh:mm aaaa"
          )}*
          *Total de colaboradores*: *${sentReport.totalperson}*
     
          *WORKING*: ${sentReport.colcking}------>${Math.round(
            (sentReport.colcking / sentReport.totalperson) * 100
          )}%
          *ON BREAK*: ${sentReport.breakIng}------>${Math.round(
            (sentReport.breakIng / sentReport.totalperson) * 100
          )}%
          *OUT*: ${sentReport.out}------>${Math.round(
            (sentReport.out / sentReport.totalperson) * 100
          )}%
          
          ${sentReport.OutNotesArr.length > 0 ? "*COLABORADORES OUT*:" : ""}
          ${sentReport.OutNotesArr}

           ${
             sentReport.vacationsOrLicenses.length > 0
               ? "*COLABORADORES EN VACACIONES O LICENCIA*:"
               : ""
           }
          ${sentReport.vacationsOrLicenses}

          ${
            sentReport.breakingPName.length > 0
              ? "*COLABORADORES ON BREAK*:"
              : ""
          }
          ${sentReport.breakingPName}
          `,
        });

        var config = {
          method: "post",
          url:
            "https://chat.googleapis.com/v1/spaces/AAAAxRtGQEY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=T4pw6nhe8H4OI_V4TMCa9dgWWZIdYdgfPs-grT3MFqo%3D",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            // console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
      };

      sendDataForTelegram(sentReport);

      sendDataForGooglechat(sentReport);
      res.status(201).send("Its work");
    } else {
      res.status(500).send({
        error: "Something Went Wrong",
        errName: "fail",
        errMessage: "not found",
        errDescription: "no activities on this range",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
  }
});
// @route   GET /api/timelog/report/locations
// @desc    return latest location from all viewed
// @access  Private token secured
router.get("/report/locations", auth, async (req, res) => {
  try {
    const users = await AuthUser.find({ timeManage: true });
    const result = await TimeLog.aggregate([
      {
        $match: {
          location: {
            $exists: true,
            $ne: null,
          },
          timestamp: {
            $gt: startOfDay(new Date()),
          },
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $group: {
          _id: "$user",
          activity: {
            $first: "$activity",
          },
          location: {
            $first: "$location",
          },
          timestamp: {
            $first: "$timestamp",
          },
        },
      },
    ]);

    let _users = [];
    users.forEach((e) => {
      locationLog = result.find((item) => item._id === e.email);
      if (locationLog) _users.push(locationLog);
    });

    res.json(_users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// @route   GET /api/timelog/report/test
// @desc    render timelog report
// @access  Private token secured
router.get("/report/test", async (req, res) => {
  try {
    await processWeeklyTimeReportTest();
    res.send("received");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// @route   GET /api/timelog/report/test02
// @desc    render timelog report Month
// @access  Private token secured
router.get("/report/test02", async (req, res) => {
  try {
    await processDayCloking();
    res.send("received");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// @route   POST /api/timelog/report/WebHook
// @desc    Note for Bot de colaboadores
// @access  Public
router.post("/report/WebHook", async (req, res) => {
  try {
    var axios = require("axios");

    var data = JSON.stringify({
      text: `*No comprendo,mensaje invalidado, Favor hablar con IT*`,
    });

    var config = {
      method: "post",
      url:
        "https://chat.googleapis.com/v1/spaces/AAAAxRtGQEY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=T4pw6nhe8H4OI_V4TMCa9dgWWZIdYdgfPs-grT3MFqo%3D",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

    res.status(201).send("Its work");
  } catch (err) {
    console.log(err);
  }
});
// @route   POST /api/timelog/report/WebHookStop
// @desc    Note for Bot de colaboadores
// @access  Public
router.post("/report/WebHookStop", async (req, res) => {
  try {
    var axios = require("axios");

    var data = JSON.stringify({
      text: `*Por favor pare de enviar mensajes invalidos, Favor hablar con IT*`,
    });

    var config = {
      method: "post",
      url:
        "https://chat.googleapis.com/v1/spaces/AAAAxRtGQEY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=T4pw6nhe8H4OI_V4TMCa9dgWWZIdYdgfPs-grT3MFqo%3D",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

    res.status(201).send("Its work");
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
