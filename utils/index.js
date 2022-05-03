const differenceInSeconds = require("date-fns/differenceInSeconds");
const differenceInCalendarDays = require("date-fns/differenceInCalendarDays");
const addDays = require("date-fns/addDays");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const isBefore = require("date-fns/isBefore");
const isAfter = require("date-fns/isAfter");
const format = require("date-fns/format");
const addMinutes = require("date-fns/addMinutes");
var compareAsc = require("date-fns/compareAsc");
var isSameDay = require("date-fns/isSameDay");
var add = require("date-fns/add");
var lodash = require("lodash");
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function processDayActivities(activities) {
  const currentActivity = activities[activities.length - 1].activity;
  let calculations = {};

  let breakInCounter = 0;
  let breakOutCounter = 0;
  let breakArray = [];
  let awayInCounter = 0;
  let awayOutCounter = 0;
  let awayArray = [];

  activities.forEach((e) => {
    switch (e.activity) {
      case "breakIn":
        breakInCounter++;
        breakArray.push(e);
        break;
      case "breakOut":
        breakOutCounter++;
        breakArray.push(e);
        break;
      case "awayIn":
        awayInCounter++;
        awayArray.push(e);
        break;
      case "awayOut":
        awayOutCounter++;
        awayArray.push(e);
        break;
    }
  });

  // Calculate break time
  const closeBreakCalculation = breakInCounter === breakOutCounter;
  const noBreakCalculation = breakInCounter === 0;
  const openBreakCalculation =
    !noBreakCalculation && breakInCounter !== breakOutCounter;

  if (closeBreakCalculation) {
    let breakCounter = 0;
    for (let i = 1; i < breakArray.length; i++) {
      const e = breakArray[i];
      if (
        breakArray[i - 1].activity === "breakIn" &&
        e.activity === "breakOut"
      ) {
        breakCounter =
          breakCounter +
          differenceInSeconds(e.timestamp, breakArray[i - 1].timestamp);
      }
    }

    calculations.breakCounter = breakCounter;
    calculations.breakCalculationType = "closeBreakCalculation";
  } else if (openBreakCalculation) {
    let _cleanBreakArray = [];

    for (let i = 0; i < breakArray.length; i++) {
      const e = breakArray[i];
      if (i === 0 && e.activity === "breakIn") {
        _cleanBreakArray.push(e);
      } else if (i !== 0 && e.activity !== breakArray[i - 1].activity) {
        _cleanBreakArray.push(e);
      }
    }

    let breakCounter = 0;

    for (let i = 0; i < _cleanBreakArray.length; i++) {
      const e = _cleanBreakArray[i];
      if (
        !!_cleanBreakArray[i - 1] &&
        _cleanBreakArray[i - 1].activity === "breakIn" &&
        e.activity === "breakOut"
      ) {
        breakCounter =
          breakCounter +
          differenceInSeconds(e.timestamp, _cleanBreakArray[i - 1].timestamp);
      } else if (
        e.activity === "breakIn" &&
        i === _cleanBreakArray.length - 1
      ) {
        breakCounter =
          breakCounter + differenceInSeconds(new Date(), e.timestamp);
      }
    }

    calculations.breakCounter = breakCounter;
    calculations.breakCalculationType = "openBreakCalculation";
  } else if (noBreakCalculation) {
    calculations.breakCalculationType = "noBreakCalculation";
    calculations.breakCounter = 0;
  }

  // Calculate away time
  const closeAwayCalculation = awayInCounter === awayOutCounter;
  const noAwayCalculation = awayInCounter === 0;
  const openAwayCalculation =
    !noAwayCalculation && awayInCounter !== awayOutCounter;

  if (closeAwayCalculation) {
    let awayCounter = 0;
    for (let i = 1; i < awayArray.length; i++) {
      const e = awayArray[i];
      if (awayArray[i - 1].activity === "awayIn" && e.activity === "awayOut") {
        awayCounter =
          awayCounter +
          differenceInSeconds(e.timestamp, awayArray[i - 1].timestamp);
      }
    }

    calculations.awayCounter = awayCounter;
    calculations.awayCalculationType = "closeAwayCalculation";
  } else if (openAwayCalculation) {
    let _cleanAwayArray = [];

    for (let i = 0; i < awayArray.length; i++) {
      const e = awayArray[i];
      if (i === 0 && e.activity === "awayIn") {
        _cleanAwayArray.push(e);
      } else if (i !== 0 && e.activity !== awayArray[i - 1].activity) {
        _cleanAwayArray.push(e);
      }
    }

    let awayCounter = 0;

    for (let i = 0; i < _cleanAwayArray.length; i++) {
      const e = _cleanAwayArray[i];
      if (
        !!_cleanAwayArray[i - 1] &&
        _cleanAwayArray[i - 1].activity === "awayIn" &&
        e.activity === "awayOut"
      ) {
        awayCounter =
          awayCounter +
          differenceInSeconds(e.timestamp, _cleanAwayArray[i - 1].timestamp);
      } else if (e.activity === "awayIn" && i === _cleanAwayArray.length - 1) {
        awayCounter =
          awayCounter + differenceInSeconds(new Date(), e.timestamp);
      }
    }

    calculations.awayCounter = awayCounter;
    calculations.awayCalculationType = "openAwayCalculation";
  } else if (noAwayCalculation) {
    calculations.awayCalculationType = "noAwayCalculation";
    calculations.awayCounter = 0;
  }

  return {
    status: "success",
    currentActivity,
    ...calculations,
  };
}

function processRangeActivities(activities, startDate, endDate, user) {
  if (activities && activities.length) {
    const rangeOfDays = differenceInCalendarDays(endDate, startDate) + 1;
    const email = user.email;
    let daysArray = [];

    for (let i = 1; i <= rangeOfDays; i++) {
      const _startDate = addDays(startOfDay(startDate), i - 1);
      const _endDate = endOfDay(_startDate);
      if (
        !["saturday", "sunday"].includes(
          format(_startDate, "EEEE").toLowerCase()
        )
      ) {
        var _scheduleStart = new Date(
          format(_startDate, "M/d/y") +
            " " +
            user.schedule[format(_startDate, "EEEE").toLowerCase()]
              .scheduleStart
        );
        var _scheduleEnd = new Date(
          format(_endDate, "M/d/y") +
            " " +
            user.schedule[format(_startDate, "EEEE").toLowerCase()].scheduleEnd
        );

        const {
          vacationStart,
          vacationEnd,
          licenseStart,
          licenseEnd,
          licenseReason,
        } = user;

        const withinVacationRange =
          (vacationStart >= _startDate && vacationStart <= _endDate) ||
          (vacationEnd >= _startDate && vacationEnd <= _endDate);

        const withinLicenseRange =
          (licenseStart >= _startDate && licenseStart <= _endDate) ||
          (licenseEnd >= _startDate && licenseEnd <= _endDate);

        //Sistem Issue choca con hora de entrada
        //shedule hours
        if (!(withinVacationRange || withinLicenseRange)) {
          //Sistem Issue choca con hora de entrada

          var changeTimeSis =
            user.sisNotes != undefined
              ? user.sisNotes
                  .map((e) => {
                    var _scheduleStartSis = null;
                    var _scheduleEndSis = null;
                    //console.log("test", format(e.timestamp), "M/d/y");

                    const sameDay = isSameDay(
                      new Date(_startDate),
                      new Date(e.timestampSis)
                    );
                    //  console.log("XD", test);
                    if (sameDay) {
                      _scheduleStartSis = new Date(
                        format(_startDate, "M/d/y") + " " + e.startSis
                      );

                      _scheduleEndSis = new Date(
                        format(_startDate, "M/d/y") + " " + e.endSis
                      );
                    }
                    if (
                      (_scheduleStartSis != null &&
                        _scheduleEndSis != null &&
                        compareAsc(
                          new Date(_scheduleStartSis),
                          new Date(_scheduleStart)
                        ) == -1) ||
                      compareAsc(
                        new Date(_scheduleStartSis),
                        new Date(_scheduleStart)
                      ) == 0
                    ) {
                      // se retorna aqui solo la fecha que esta antes
                      // o es igual a la entrada de la persona
                      return _scheduleEndSis;
                    }
                  })
                  .filter((e) => e != undefined)
              : null;

          const __sheduleEnd = _scheduleEnd;
          const __scheduleStart =
            changeTimeSis != null
              ? changeTimeSis[0] != undefined
                ? changeTimeSis[0]
                : _scheduleStart
              : _scheduleStart;

          var minutestoLess =
            user.sisNotes != undefined
              ? user.sisNotes
                  .map((e) => {
                    var _scheduleStartSis = null;
                    var _scheduleEndSis = null;
                    const sameDay = isSameDay(
                      new Date(_startDate),
                      new Date(e.timestampSis)
                    );

                    if (sameDay) {
                      _scheduleStartSis = new Date(
                        format(_startDate, "M/d/y") + " " + e.startSis
                      );

                      _scheduleEndSis = new Date(
                        format(_startDate, "M/d/y") + " " + e.endSis
                      );
                    }
                    if (
                      _scheduleStartSis != null &&
                      _scheduleEndSis != null &&
                      compareAsc(
                        new Date(_scheduleStartSis),
                        new Date(_scheduleStart)
                      ) == 1
                    ) {
                      return differenceInSeconds(
                        _scheduleEndSis,
                        _scheduleStartSis
                      );
                    }
                  })
                  .filter((e) => e != undefined)
              : null;

          const idealScheduleTime =
            minutestoLess != null
              ? lodash.sum(minutestoLess) > 0
                ? differenceInSeconds(__sheduleEnd, __scheduleStart) -
                  lodash.sum(minutestoLess)
                : differenceInSeconds(__sheduleEnd, __scheduleStart)
              : differenceInSeconds(__sheduleEnd, __scheduleStart);

          const activitiesInRange = activities.filter(
            (e) =>
              isBefore(e.timestamp, _endDate) &&
              isAfter(e.timestamp, _startDate)
          );
          let calculations = {};
          let clocking;
          let out;

          if (activitiesInRange.length) {
            const clockedIn = activitiesInRange[0].activity === "clockin";
            clocking =
              activitiesInRange[0].activity === "clockin"
                ? activitiesInRange[0].timestamp
                : "NA";
            const clockedOut =
              activitiesInRange[activitiesInRange.length - 1].activity ===
              "clockout";
            calculations.clockedInLate = clockedIn
              ? isAfter(
                  activitiesInRange[0].timestamp,
                  addMinutes(__scheduleStart, 6)
                )
              : false;
            out =
              activitiesInRange[activitiesInRange.length - 1].activity ===
              "clockout"
                ? activitiesInRange[activitiesInRange.length - 1].timestamp
                : "NA";

            let clockInCounter = 0;
            let clockOutCounter = 0;
            let breakInCounter = 0;
            let breakOutCounter = 0;
            let awayInCounter = 0;
            let awayOutCounter = 0;
            let clockArray = [];
            let breakArray = [];
            let awayArray = [];

            activitiesInRange.forEach((e) => {
              switch (e.activity) {
                case "clockin":
                  clockInCounter++;
                  clockArray.push(e);
                  break;
                case "clockout":
                  clockOutCounter++;
                  clockArray.push(e);
                  break;
                case "breakIn":
                  breakInCounter++;
                  breakArray.push(e);
                  break;
                case "breakOut":
                  breakOutCounter++;
                  breakArray.push(e);
                  break;
                case "awayIn":
                  awayInCounter++;
                  awayArray.push(e);
                  break;
                case "awayOut":
                  awayOutCounter++;
                  awayArray.push(e);
                  break;
              }
            });

            calculations.clockedIn = clockedIn;
            calculations.clockedOut = clockedOut;

            // Calculate clockin time
            const closeClockCalculation =
              clockedIn && clockedOut && clockInCounter === clockOutCounter;
            const openClockCalculation =
              clockedIn && clockedOut && clockInCounter !== clockOutCounter;
            const incompleteClockCalculation = !clockedIn || !clockedOut;

            if (closeClockCalculation) {
              let clockedInCounter = 0;
              let inScheduleClockInCounter = 0;
              for (let i = 1; i < clockArray.length; i++) {
                const e = clockArray[i];
                if (
                  clockArray[i - 1].activity === "clockin" &&
                  e.activity === "clockout"
                ) {
                  clockedInCounter =
                    clockedInCounter +
                    differenceInSeconds(
                      e.timestamp,
                      clockArray[i - 1].timestamp
                    );

                  const clockInBeforeStart = isBefore(
                    clockArray[i - 1].timestamp,
                    __scheduleStart
                  );
                  const clockOutAfterStart = isAfter(e.timestamp, __sheduleEnd);

                  if (clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter = differenceInSeconds(
                      __sheduleEnd,
                      __scheduleStart
                    );
                  } else if (clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(e.timestamp, __scheduleStart);
                  } else if (!clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        __sheduleEnd,
                        clockArray[i - 1].timestamp
                      );
                  } else if (!clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        e.timestamp,
                        clockArray[i - 1].timestamp
                      );
                  }
                }
              }

              calculations.clockInCounter = clockedInCounter;
              calculations.clockCalculationType = "closeClockCalculation";
              calculations.inScheduleClockInCounter = inScheduleClockInCounter;
            } else if (openClockCalculation) {
              let clockedInCounter = 0;
              let inScheduleClockInCounter = 0;
              let _cleanClockArray = [];

              for (let i = 0; i < clockArray.length; i++) {
                const e = clockArray[i];
                if (i === 0) {
                  if (e.activity === "clockin") {
                    _cleanClockArray.push(e);
                  }
                } else {
                  if (
                    e.activity === "clockin" &&
                    clockArray[i - 1].activity === "clockout"
                  ) {
                    _cleanClockArray.push(e);
                  } else if (
                    e.activity === "clockout" &&
                    clockArray[i - 1].activity !== "clockout"
                  ) {
                    _cleanClockArray.push(e);
                  }
                }
              }

              for (let i = 1; i < _cleanClockArray.length; i++) {
                const e = _cleanClockArray[i];
                if (
                  _cleanClockArray[i - 1].activity === "clockin" &&
                  e.activity === "clockout"
                ) {
                  clockedInCounter =
                    clockedInCounter +
                    differenceInSeconds(
                      e.timestamp,
                      _cleanClockArray[i - 1].timestamp
                    );

                  const clockInBeforeStart = isBefore(
                    _cleanClockArray[i - 1].timestamp,
                    __scheduleStart
                  );
                  const clockOutAfterStart = isAfter(e.timestamp, __sheduleEnd);

                  if (clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter = differenceInSeconds(
                      __sheduleEnd,
                      __scheduleStart
                    );
                  } else if (clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(e.timestamp, __scheduleStart);
                  } else if (!clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        __sheduleEnd,
                        _cleanClockArray[i - 1].timestamp
                      );
                  } else if (!clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        e.timestamp,
                        _cleanClockArray[i - 1].timestamp
                      );
                  }
                }
              }

              calculations.clockInCounter = clockedInCounter;
              calculations.clockCalculationType = "openClockCalculation";
              calculations.inScheduleClockInCounter = inScheduleClockInCounter;
            } else if (incompleteClockCalculation) {
              let clockedInCounter = 0;
              let inScheduleClockInCounter = 0;
              let _cleanClockArray = [];
              let incompleteAlert = "";
              if (!clockedIn && !clockedOut) {
                _cleanClockArray = [
                  {
                    user: email,
                    activity: "clockin",
                    timestamp: __scheduleStart,
                  },
                  ...clockArray,
                  {
                    user: email,
                    activity: "clockout",
                    timestamp: __sheduleEnd,
                  },
                ];
                incompleteAlert = "Fake clockin and clockout";
              } else if (!clockedIn) {
                _cleanClockArray = [
                  {
                    user: email,
                    activity: "clockin",
                    timestamp: __scheduleStart,
                  },
                  ...clockArray,
                ];

                incompleteAlert = "Fake clockin";
              } else if (!clockedOut) {
                _cleanClockArray = [
                  ...clockArray,
                  {
                    user: email,
                    activity: "clockout",
                    timestamp: __sheduleEnd,
                  },
                ];

                incompleteAlert = "Fake clockout";
              }

              let __cleanClockArray = [];

              for (let i = 0; i < _cleanClockArray.length; i++) {
                const e = _cleanClockArray[i];
                if (i === 0) {
                  if (e.activity === "clockin") {
                    __cleanClockArray.push(e);
                  }
                } else {
                  if (
                    !(
                      e.activity === "clockin" &&
                      _cleanClockArray[i - 1].activity === "clockin"
                    )
                  ) {
                    __cleanClockArray.push(e);
                  } else if (e.activity === "clockout") {
                    __cleanClockArray.push(e);
                  }
                }
              }

              for (let i = 1; i < __cleanClockArray.length; i++) {
                const e = __cleanClockArray[i];
                if (
                  __cleanClockArray[i - 1].activity === "clockin" &&
                  e.activity === "clockout"
                ) {
                  clockedInCounter =
                    clockedInCounter +
                    differenceInSeconds(
                      e.timestamp,
                      __cleanClockArray[i - 1].timestamp
                    );

                  const clockInBeforeStart = isBefore(
                    __cleanClockArray[i - 1].timestamp,
                    __scheduleStart
                  );
                  const clockOutAfterStart = isAfter(e.timestamp, __sheduleEnd);

                  if (clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter = differenceInSeconds(
                      __sheduleEnd,
                      __scheduleStart
                    );
                  } else if (clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(e.timestamp, __scheduleStart);
                  } else if (!clockInBeforeStart && clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        __sheduleEnd,
                        __cleanClockArray[i - 1].timestamp
                      );
                  } else if (!clockInBeforeStart && !clockOutAfterStart) {
                    inScheduleClockInCounter =
                      inScheduleClockInCounter +
                      differenceInSeconds(
                        e.timestamp,
                        __cleanClockArray[i - 1].timestamp
                      );
                  }
                }
              }

              calculations.clockInCounter = clockedInCounter;
              calculations.clockCalculationType = "incompleteClockCalculation";
              calculations.clockIncompleteAlert = incompleteAlert;
              calculations.inScheduleClockInCounter = inScheduleClockInCounter;
            }

            // Calculate break time
            const closeBreakCalculation = breakInCounter === breakOutCounter;
            const noBreakCalculation =
              breakInCounter === 0 || breakOutCounter === 0;
            const openBreakCalculation =
              !noBreakCalculation && breakInCounter !== breakOutCounter;

            if (closeBreakCalculation) {
              let breakCounter = 0;
              for (let i = 1; i < breakArray.length; i++) {
                const e = breakArray[i];
                if (
                  breakArray[i - 1].activity === "breakIn" &&
                  e.activity === "breakOut"
                ) {
                  breakCounter =
                    breakCounter +
                    differenceInSeconds(
                      e.timestamp,
                      breakArray[i - 1].timestamp
                    );
                }
              }

              calculations.breakCounter = breakCounter;
              calculations.breakCalculationType = "closeBreakCalculation";
            } else if (openBreakCalculation) {
              let _cleanBreakArray = [];

              for (let i = 0; i < breakArray.length; i++) {
                const e = breakArray[i];
                if (i === 0) {
                  if (e.activity === "breakIn") {
                    _cleanBreakArray.push(e);
                  }
                } else {
                  if (
                    e.activity === "breakIn" &&
                    breakArray[i - 1].activity === "breakOut"
                  ) {
                    _cleanBreakArray.push(e);
                  } else if (
                    e.activity === "breakOut" &&
                    breakArray[i - 1].activity === "breakIn"
                  ) {
                    _cleanBreakArray.push(e);
                  }
                }
              }

              let breakCounter = 0;
              for (let i = 1; i < _cleanBreakArray.length; i++) {
                const e = _cleanBreakArray[i];
                if (
                  _cleanBreakArray[i - 1].activity === "breakIn" &&
                  e.activity === "breakOut"
                ) {
                  breakCounter =
                    breakCounter +
                    differenceInSeconds(
                      e.timestamp,
                      _cleanBreakArray[i - 1].timestamp
                    );
                }
              }

              calculations.breakCounter = breakCounter;
              calculations.breakCalculationType = "openBreakCalculation";
            } else if (noBreakCalculation) {
              calculations.breakCalculationType = "noBreakCalculation";
            }

            // Calculate away time
            const closeAwayCalculation = awayInCounter === awayOutCounter;
            const noAwayCalculation =
              awayInCounter === 0 || awayOutCounter === 0;
            const openAwayCalculation =
              !noAwayCalculation && awayInCounter !== awayOutCounter;

            if (closeAwayCalculation) {
              let awayCounter = 0;
              for (let i = 1; i < awayArray.length; i++) {
                const e = awayArray[i];
                if (
                  awayArray[i - 1].activity === "awayIn" &&
                  e.activity === "awayOut"
                ) {
                  awayCounter =
                    awayCounter +
                    differenceInSeconds(
                      e.timestamp,
                      awayArray[i - 1].timestamp
                    );
                }
              }

              calculations.awayCounter = awayCounter;
              calculations.awayCalculationType = "closeAwayCalculation";
            } else if (openAwayCalculation) {
              let _cleanAwayArray = [];

              for (let i = 0; i < awayArray.length; i++) {
                const e = awayArray[i];
                if (i === 0) {
                  if (e.activity === "awayIn") {
                    _cleanAwayArray.push(e);
                  }
                } else {
                  if (
                    e.activity === "awayIn" &&
                    awayArray[i - 1].activity === "awayOut"
                  ) {
                    _cleanAwayArray.push(e);
                  } else if (
                    e.activity === "awayOut" &&
                    awayArray[i - 1].activity === "awayIn"
                  ) {
                    _cleanAwayArray.push(e);
                  }
                }
              }

              let awayCounter = 0;
              for (let i = 1; i < _cleanAwayArray.length; i++) {
                const e = _cleanAwayArray[i];
                if (
                  _cleanAwayArray[i - 1].activity === "awayIn" &&
                  e.activity === "awayOut"
                ) {
                  awayCounter =
                    awayCounter +
                    differenceInSeconds(
                      e.timestamp,
                      _cleanAwayArray[i - 1].timestamp
                    );
                }
              }

              calculations.awayCounter = awayCounter;
              calculations.awayCalculationType = "openAwayCalculation";
            } else if (noAwayCalculation) {
              calculations.awayCalculationType = "noAwayCalculation";
            }
          }

          daysArray.push({
            startDate: _startDate,
            endDate: _endDate,
            scheduleStart: __scheduleStart,
            scheduleEnd: __sheduleEnd,
            day: i,
            Note: user.dailyNotes,
            IssueNote: user.sisNotes,
            idealScheduleTime,
            activities: activitiesInRange,
            firstCloking: clocking,
            Logout: out,
            break:
              user.schedule[
                format(new Date(__scheduleStart), "EEEE").toLowerCase()
              ].breakTime,
            ...calculations,
          });
        } else {
          daysArray.push({
            startDate: _startDate,
            endDate: _endDate,
            scheduleStart: _scheduleStart,
            scheduleEnd: _scheduleEnd,
            day: i,
            Note: user.dailyNotes,
            IssueNote: user.sisNotes,
            activities: [],
            outRange: true,
            outNote: `within ${withinVacationRange ? "vacation" : ""}${
              withinLicenseRange ? `license: ${user.licenseReason}` : ""
            } range`,
          });
        }
      }
    }

    const daysWithActivities = daysArray.filter(
      (e) => e.activities.length
    ).length;

    return {
      status: "success",
      rangeOfDays,
      daysWithActivities,
      daysArray,
    };
  } else {
    return {
      status: "fail",
      reason: "not found",
      message: "No activity for this user",
    };
  }
}

module.exports = {
  groupBy,
  processDayActivities,
  processRangeActivities,
  asyncForEach,
};
