const nodemailer = require("nodemailer");
const config = require("config");
const emailUser = config.get("EMAIL_USER");
const emailPass = config.get("EMAIL_PASS");
const fetch = require("node-fetch");

const AuthUser = require("../models/AuthUser");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function processMonthClokingReportTest() {
  try {
    const users = await AuthUser.find({ timeManage: true });

    const _leads = users.filter((e) => e.role === "lead");
    let transporter = nodemailer.createTransport({
      // host: "smtp.zoho.com",
      // port: 465,
      // secure: true, // true for 465, false for other ports
      // auth: {
      //   user: emailUser,
      //   pass: emailPass,
      // },
      host: "smtp-relay.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        type:"login",
        user: emailUser,
        pass: emailPass,
      },
    });
    const result3 = await fetch("http://165.22.188.206:1880/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "http://165.227.93.101:5000/api/timelog/report/reportagentsMonth",
        landscape: true,
      }),
    });

    const result4 = await result3.json();

    let info2 = await transporter.sendMail({
      from: '"Michael castillo" <michael@ualett.com>', // sender address
      to: "michael@ualett.com", // list of receivers
      subject: "Month Time Report", // Subject line
      html: "<b>Greetings, attached you will find the report from this Month.</b>", // html body
      attachments: [
        {
          filename: `Month Time Report`,
          path: `http://165.22.188.206:1880/api/pdf/${result4.file}`,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = processMonthClokingReportTest;
