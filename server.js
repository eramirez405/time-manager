const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const add = require("date-fns/add");
const path = require("path");
const requestIp = require("request-ip");
const processWeeklyTimeReport = require("./utils/processWeeklyTimeReport");
const processMonthClokingReport = require("./utils/processMonthClokingReport");
const processLogsReport = require("./utils/processLogsReport");
const processDayCloking = require("./utils/processDayCloking");
const AuthUser = require("./models/AuthUser");
const Event = require("./models/Event");
const OutboundEvent = require("./models/OutboundEvent");
const OutboundRecord = require("./models/OutboundRecord");
var CronJob = require("cron").CronJob;
const os = require("os");
const winston = require("winston");
require("winston-syslog");
const config = require("config");

const environment = config.get("ENV");

//Creating a transport to link Papertrail with the logger
const papertrail = new winston.transports.Syslog({
  host: "logs6.papertrailapp.com",
  port: 26143,
  protocol: "tls4",
  localhost: os.hostname(),
  eol: "\n",
});

//Creating the Winston logger with the transport created
const paperLogger = winston.createLogger({
  format: winston.format.simple(),
  levels: winston.config.syslog.levels,
  transports: [papertrail],
});

// cors
app.use(cors({ origin: true, credentials: true }));

// ip middleware
app.use(requestIp.mw());

// Connect Database
connectDB();

// io connection
io.on("connection", (socket) => {
  socket.emit("connection", null);

  socket.on("disconnect", () => {});
});

app.set("socketio", io);

var job1 = new CronJob(
  // '30 * * * * *',
  "* * 23 * * 6",
  async function () {
    try {
      const result = await Event.deleteMany({
        createdAt: { $lt: add(new Date(), { days: -7 }) },
      });
      console.log("CronJob Events Cleanup Executed!");
      paperLogger.info("CronJob Events Cleanup Executed!");
      console.log(new Date());
      paperLogger.info(new Date());
      console.log(result);
      paperLogger.info(result);
    } catch (err) {
      console.error(err);
      paperLogger.info(err);
    }
  },
  null,
  true
);

var job2 = new CronJob(
  // '30 * * * * *',
  "50 23 * * 1,3,5",
  async function () {
    try {
      const result = await OutboundEvent.deleteMany({
        date: { $lt: add(new Date(), { days: -2 }) },
      });
      console.log("CronJob OutboundEvents Cleanup Executed!");
      paperLogger.info("CronJob OutboundEvents Cleanup Executed!");
      console.log(new Date());
      paperLogger.info(new Date());
      console.log(result);
      paperLogger.info(result);
    } catch (err) {
      console.error(err);
      paperLogger.info(err);
    }
  },
  null,
  true
);

var job3 = new CronJob(
  // '30 * * * * *',
  //se ejecuta a las 3 horas todos los dias
  "0 3 * * *",
  async function () {
    try {
      const result = await OutboundRecord.deleteMany({});
      console.log("CronJob OutboundRecord Cleanup Executed!");
      paperLogger.info("CronJob OutboundRecord Cleanup Executed!");
      console.log(new Date());
      paperLogger.info(new Date());
      console.log(result);
      paperLogger.info(result);
    } catch (err) {
      console.error(err);
      paperLogger.info(err);
    }
  },
  null,
  true
);

var job4 = new CronJob(
  // "50 * * * *",
  "0 22 * * 5",
  async function () {
    console.log("Process weekly time report executed " + new Date());
    paperLogger.info("Process weekly time report executed " + new Date());
    await processWeeklyTimeReport();
  },
  null,
  true
);
var job5 = new CronJob(
  // "42 * * * *",
  // se ejecuta los domingos  alas 1 am.
  " 59 0 * * 0",

  async function () {
    console.log("Delete All Notes");
    paperLogger.info("Delete All Notes");
    try {
      const test = await AuthUser.updateMany(
        {},
        {
          $set: {
            dailyNotes: {},
          },
        },

        {
          new: true,
        }
      );

      const erraseSisnote = await AuthUser.updateMany(
        {},
        {
          $set: {
            sisNotes: {},
          },
        },
        {
          new: true,
        }
      );
    } catch (problem) {
      console.log(problem);
      paperLogger.info(problem);
      res.status(500).send("Internal Server Error");
    }
  },
  null,
  true
);
var job6 = new CronJob(
  // "40 * * * *",
  "0 0 01 * *",
  async function () {
    console.log("Process Month time report executed " + new Date());
    paperLogger.info("Process Month time report executed " + new Date());
    await processMonthClokingReport();
  },
  null,
  true
);

//Comment this Job7 while on Dev
var job7 = new CronJob(
  // "42 * * * *",
  "20,50 9-19 * * 1-5",
  //"52 * * * 1-5",
  async function () {
    console.log("Process timelogs  report executed " + new Date());
    paperLogger.info("Process timelogs  report executed " + new Date());
    await processLogsReport();
  },
  null,
  true
);

///esto es un job para un reporte diario de los clocking
var job8 = new CronJob(
  // "42 * * * *",
  "15 15 * * 1-5",
  // "30 * * * 1-5",
  async function () {
    console.log("Process Day clocking report executed " + new Date());
    paperLogger.info("Process Day clocking report executed " + new Date());
    await processDayCloking();
  },
  null,
  true
);
job1.start();
job2.start();
job3.start();
job4.start();
job5.start();
job6.start();
if (environment === "production") {
  job7.start();
}
job8.start();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "client/build")));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// Init Middleware
app.use(express.json({ extended: false }));

// Define routes
app.get("/api/test", (req, res) => res.send("Hello World!"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/twilio", require("./routes/twilio"));
app.use("/api/numbersPool", require("./routes/numbersPool"));
app.use("/api/outbound", require("./routes/outboundLimit"));
app.use("/api/workerActivityEvent", require("./routes/workerActivityEvent"));
app.use("/api/timelog", require("./routes/timelog"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  paperLogger.info(`Server started on port ${PORT}`);
});

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
