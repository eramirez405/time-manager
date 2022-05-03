const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const AuthUser = require("../models/AuthUser");
const format = require("date-fns/format");
var axios = require("axios");
// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/",
  auth,
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, active } = req.body;

    try {
      let user = await AuthUser.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new AuthUser({
        name,
        email,
        password,
        role,
        active: !!active ? true : false,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/users
// @desc    Get all users
// @access  Protected
router.get("/", auth, async (req, res) => {
  try {
    const users = await AuthUser.find({});
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});

// @route   GET api/users/emails
// @desc    Get all the agents emails
// @access  Private
router.get("/emails", async (req, res) => {
  try {
    const allUsers = await AuthUser.aggregate([
      {
        $match: {
          department: {
            $in: ["Push", "Repetition", "Inbound & Chat", "Overdue", "Operations"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          email: 1,
        },
      },
    ]);
    res.json(allUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});

// @route   PATCH api/users
// @desc    PATCH all users
// @access  Protected
router.patch("/:id", auth, async (req, res) => {
  const { role, status, password, timeManage } = req.body;
  const { id } = req.params;
  try {
    if (role) {
      await AuthUser.updateOne({ _id: id }, { role });
    } else if (status) {
      await AuthUser.updateOne({ _id: id }, { status });
    } else if (timeManage || timeManage === false) {
      await AuthUser.updateOne({ _id: id }, { timeManage });
    } else if (password) {
      const salt = await bcrypt.genSalt(10);

      const CryptedPass = await bcrypt.hash(password, salt);

      await AuthUser.updateOne({ _id: id }, { password: CryptedPass });
    }
    const user = await AuthUser.findOne({ _id: id });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});

// @route   PATCH api/users/info
// @desc    PATCH all users
// @access  Protected
router.patch("/info/:id", auth, async (req, res) => {
  const {
    backofficeId,
    department,
    vacationStart,
    vacationEnd,
    licenseStart,
    licenseEnd,
    licenseReason,
    schedule,
  } = req.body;
  const { id } = req.params;
  try {
    await AuthUser.updateOne(
      { _id: id },
      {
        backofficeId,
        department,
        vacationStart,
        vacationEnd,
        schedule,
        ...(!!licenseStart ? { licenseStart } : {}),
        ...(!!licenseEnd ? { licenseEnd } : {}),
        ...(!!licenseReason ? { licenseReason } : {}),
      }
    );
    const user = await AuthUser.findOne({ _id: id });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Something Went Wrong",
      errName: err.name,
      errMessage: err.message,
      errDescription: err.description,
    });
    v;
  }
});

// @route   DELETE api/users
// @desc    Delete a user
// @access  Protected
router.delete(
  "/:id",
  // auth,
  async (req, res) => {
    const { id } = req.params;
    try {
      const users = await AuthUser.deleteOne({ _id: id });
      res.json(users);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Something Went Wrong",
        errName: err.name,
        errMessage: err.message,
        errDescription: err.description,
      });
    }
  }
);

// @route   GET api/users/timelog
// @desc    Get all users with time manage true
// @access  Protected
router.get("/timelog", auth, async (req, res) => {
  try {
    const users = await AuthUser.find({ timeManage: true });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
});
// @route   PUT api/users/savedNote
// @desc   save Note for Agents
// @access  Public
router.put("/savedNote", auth, async (req, res) => {
  try {
    const test = await AuthUser.findOneAndUpdate(
      { email: req.body.Id },
      {
        $addToSet: {
          dailyNotes: {
            note: req.body.dailyNotes,
            poster: req.user.email,
            timestamp: new Date(),
          },
        },
      },
      {
        new: true,
      }
    );

    res.status(201).send("Its work");
  } catch (problem) {
    console.log(problem);
    res.status(500).send("Internal Server Error");
  }
});
// @route   PUT api/users/savedNoteSis
// @desc   save Note for Agents
// @access  Public
router.put("/savedNoteSis", auth, async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.user.email);
    const dataexport = await AuthUser.findOneAndUpdate(
      { email: req.body.Id },
      {
        $addToSet: {
          sisNotes: {
            noteSis: req.body.NoteSis,
            startSis: req.body.HourStar,
            endSis: req.body.HourdEnd,
            posterSis: req.user.email,
            timestampSis: new Date(),
          },
        },
      },
      {
        new: true,
      }
    );
    // console.log(dataexport);
    res.status(201).send("Its work");
  } catch (problem) {
    console.log(problem);
    res.status(500).send("Internal Server Error");
  }
});
// @route   POST api/sendNoteBot
// @desc    Note for Bot
// @access  Public
router.post("/sendNoteBot", async (req, res) => {
  try {
    // const members = [
    //   // 392, //michael
    //   // 132, //boss
    //   // 5616, //SirJulay
    //   // 1090, //SirOscar
    //   132, //Erasmo
    //   20, //Ricky
    //   40, //Marlenee
    //   140, //Pamela,
    //   392, // Michael
    //   1398, // Luis Vidal
    //   // aqui se ponen las personas que les va a llegar las notas
    // ];
    // // members.forEach((Id) => {
    // //   var axios = require("axios");
    // //   var data = JSON.stringify({
    // //     USER_ID: Id,
    // //     MESSAGE: `[B]REPORTE DE COLABORADORES [/B]

    // //  [B]Colaborador[/B]: ${req.body.Email}
    // //  [B]RAZON[/B]: ${req.body.message}`,
    // //   });

    // //   var config = {
    // //     method: "post",
    // //     url: "https://ualett.bitrix24.com/rest/134/v5v48fs0pdz0npmt/im.message.add",
    // //     headers: {
    // //       "Content-Type": "application/json",
    // //       Cookie: "BITRIX_SM_SALE_UID=0; qmb=.",
    // //     },
    // //     data: data,
    // //   };

    // //   axios(config)
    // //     .then(function (response) {
    // //       //console.log(JSON.stringify(response.data));
    // //     })
    // //     .catch(function (error) {
    // //       console.log(error);
    // //     });
    // // });

    const sendDataForTelegram = async (data) => {
      var axios = require("axios");
      var data = JSON.stringify({
        chatID: "-1001527642595",
        message: `REPORTE DE COLABORADORES  
      Colaborador:${data.Email}
       Razon:${data.message}
       Hora:${data.hour}`,
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

    const sendDataForGooglechat = async (data) => {
      var axios = require("axios");

      var data = JSON.stringify({
        text: `*REPORTE DE COLABORADORES*
         *Colaborador*:${data.Email}
         *Razon*:${data.message}
         *Hora*:${data.hour}`,
      });

      var config = {
        method: "post",
        url: "https://chat.googleapis.com/v1/spaces/AAAAxRtGQEY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=T4pw6nhe8H4OI_V4TMCa9dgWWZIdYdgfPs-grT3MFqo%3D",
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
    sendDataForGooglechat(req.body);
    sendDataForTelegram(req.body);
    res.status(201).send("Its work");
  } catch (err) {
    console.log(err);
  }
});
// @route   POST api/users/sendNoteLicenseOrVacationBot
// @desc    Note for Bot
// @access  Public
router.post("/sendNoteLicenseOrVacationBot", async (req, res) => {
  try {
    console.log("Execute");
    const members = [
      392, //michael
      132, //boss
      5616, //SirJulay
      1090, //SirOscar
      132, //Erasmo
      // 20, //Ricky
      // 40, //Marlenee
      // 140, //Pamela,
      // 392, // Michael
      // 1398, // Luis Vidal
      // aqui se ponen las personas que les va a llegar las notas
    ];
    members.forEach((Id) => {
      var data = JSON.stringify({
        USER_ID: Id,
        MESSAGE: `[B]REPORTE DE COLABORADORES [/B]

     [B]Colaborador[/B]: ${req.body.Id}
     
     [B]RAZON[/B]: ${
       req.body.Reason != undefined ? req.body.Reason : "Vacaciones"
     }

     [B]Inicio[/B]:${format(new Date(req.body.Start), "M/d/y")}

     [B]Fin[/B]:${format(new Date(req.body.End), "M/d/y")}
     `,
      });

      var config = {
        method: "post",
        url: "https://ualett.bitrix24.com/rest/134/v5v48fs0pdz0npmt/im.message.add",
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

    const sendDataForTelegram = async (data) => {
      var axios = require("axios");
      var data = JSON.stringify({
        chatID: "-1001527642595",
        message: `REPORTE DE COLABORADORES

        Colaborador: ${data.Id}
        
        RAZON: ${data.Reason != undefined ? data.Reason : "Vacaciones"}

        Inicio:${format(new Date(data.Start), "M/d/y")}

        Fin:${format(new Date(data.End), "M/d/y")}
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
    const sendDataForGooglechat = async (data) => {
      var axios = require("axios");

      var data = JSON.stringify({
        text: `*REPORTE DE COLABORADORES*

         *Colaborador*: ${data.Id}
         
         *RAZON*: ${data.Reason != undefined ? data.Reason : "Vacaciones"}
 
         *Inicio*:${format(new Date(data.Start), "M/d/y")}
 
         *Fin*:${format(new Date(data.End), "M/d/y")}
         `,
      });

      var config = {
        method: "post",
        url: "https://chat.googleapis.com/v1/spaces/AAAAxRtGQEY/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=T4pw6nhe8H4OI_V4TMCa9dgWWZIdYdgfPs-grT3MFqo%3D",
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
    sendDataForGooglechat(req.body);
    sendDataForTelegram(req.body);
    res.status(201).send("Its work");
  } catch (err) {
    console.log(err);
  }
});
// @route   PUT api/users/GetLastNote
// @desc   get Last Note for Agents
// @access  Public
router.post("/GetLastNote", async (req, res) => {
  try {
    const result = await AuthUser.aggregate([
      {
        $match: {
          email: req.body.email,
        },
      },
      {
        $unwind: {
          path: "$dailyNotes",
        },
      },
      {
        $project: {
          _id: 0,
          _id: "$email",
          note: "$dailyNotes.note",
          poster: "$dailyNotes.poster",
          timestamp: "$dailyNotes.timestamp",
          hour: {
            $dateToString: {
              format: "%H:%M",
              date: "$dailyNotes.timestamp",
            },
          },
          formatDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$dailyNotes.timestamp",
            },
          },
        },
      },
      {
        $match: {
          timestamp: {
            $gt: startOfDay(new Date()),
            $lte: endOfDay(new Date()),
          },
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            timestamp: "$formatDate",
          },
          lastNote: {
            $push: {
              _id: "$_id",
              note: "$note",
              timestamp: "$timestamp",
              poster: "$poster",
              FormatDate: "$formatDate",
              hour: "$hour",
            },
          },
        },
      },
    ]);

    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// @route   PUT api/users/GetLastNoteSis
// @desc   get Last Note for Agents
// @access  Public
router.post("/GetLastNoteSis", async (req, res) => {
  try {
    const result = await AuthUser.aggregate([
      {
        $match: {
          email: req.body.email,
        },
      },
      {
        $unwind: {
          path: "$SisNotes",
        },
      },
      {
        $project: {
          _id: 0,
          _id: "$email",
          note: "$SisNotes.note",
          poster: "$SisNotes.poster",
          timestamp: "$SisNotes.timestamp",
          hour: {
            $dateToString: {
              format: "%H:%M",
              date: "$SisNotes.timestamp",
            },
          },
          formatDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$SisNotes.timestamp",
            },
          },
          start: "$SisNotes.start",
          end: "$SisNotes.end",
        },
      },
      {
        $match: {
          timestamp: {
            $gt: startOfDay(new Date()),
            $lte: endOfDay(new Date()),
          },
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            timestamp: "$formatDate",
          },
          lastNote: {
            $push: {
              _id: "$_id",
              note: "$note",
              timestamp: "$timestamp",
              poster: "$poster",
              FormatDate: "$formatDate",
              hour: "$hour",
              start: "$start",
              end: "$end",
            },
          },
        },
      },
    ]);
    // console.log("XD", result);
    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// @route   PUT api/users/getAllNotes
// @desc   get All Note for Agents
// @access  Public
router.post("/GetAllNotes", async (req, res) => {
  try {
    const result = await AuthUser.aggregate([
      {
        $addFields: {
          AllNotes: {
            $cond: {
              if: {
                $isArray: "$sisNotes",
              },
              then: {
                $concatArrays: ["$dailyNotes", "$sisNotes"],
              },
              else: "$dailyNotes",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$AllNotes",
        },
      },
      {
        $project: {
          _id: "$email",
          note: "$AllNotes.note",
          poster: "$AllNotes.poster",
          timestamp: "$AllNotes.timestamp",
          formatDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$AllNotes.timestamp",
            },
          },
          SisNotes: "$AllNotes.noteSis",
          formatDateSis: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$AllNotes.timestampSis",
            },
          },
          SisStar: "$AllNotes.startSis",
          SisEnd: "$AllNotes.endSis",
          timestampSis: "$AllNotes.timestampSis",
        },
      },
      {
        $match: {
          $or: [
            {
              timestamp: {
                $gte: new Date(req.body.StartDate),
                $lte: new Date(req.body.EndDate),
              },
            },
            {
              timestampSis: {
                $gte: new Date(req.body.StartDate),
                $lte: new Date(req.body.EndDate),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            timestamp: {
              $ifNull: ["$formatDate", "$formatDateSis"],
            },
          },
          DateNote: {
            $push: {
              _id: "$_id",
              note: "$note",
              timestamp: "$timestamp",
              poster: "$poster",
              FormatDate: "$formatDate",
              SisNotes: "$SisNotes",
              formatDateSis: "$formatDateSis",
              SisStar: "$SisStar",
              SisEnd: "$SisEnd",
              timestampSis: "$timestampSis",
            },
          },
        },
      },
    ]);

    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
