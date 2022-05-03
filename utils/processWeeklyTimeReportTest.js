const nodemailer = require("nodemailer");
const config = require("config");
const emailUser = config.get("EMAIL_USER");
const emailPass = config.get("EMAIL_PASS");
const fetch = require("node-fetch");

const AuthUser = require("../models/AuthUser");

async function processWeeklyTimeReport() {
  try {
    const users = await AuthUser.find({ timeManage: true });

    const _leads = users.filter((e) => e.role === "lead");

    const result1 = await fetch("http://165.22.188.206:1880/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `http://165.227.93.101:5000/api/timelog/report/agents/[${_leads.map(
          (e) => e.email
        )}]`,
        landscape: true,
      }),
    });

    const result2 = await result1.json();

    let transporter = nodemailer.createTransport({
      host: "smtp-relay.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        type:"login",
        user: emailUser,
        pass: emailPass,
      },
    });

    // let info1 = await transporter.sendMail({
    //   from: '"Erasmo Ramirez" <erasmo@ualett.com>', // sender address
    //   to: "pamela@ualett.com", // list of receivers
    //   subject: "Weekly Time Report", // Subject line
    //   html:
    //     "<b>Greetings, attached you will find the report from this week of your leads.</b>", // html body
    //   attachments: [
    //     {
    //       filename: `Weekly Time Report`,
    //       path: `http://165.22.188.206:1880/api/pdf/${result2.file}`,
    //       contentType: "application/pdf",
    //     },
    //   ],
    // });

    const result3 = await fetch("http://165.22.188.206:1880/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "http://165.227.93.101:5000/api/timelog/report",
        landscape: true,
      }),
    });

    const result4 = await result3.json();

    let info2 = await transporter.sendMail({
      from: '"Michael Castillo" <michael@ualett.com>', // sender address
      to: "michael@ualett.com,erasmo@ualett.com", // list of receivers
      subject: "Weekly Time Report", // Subject line
      html: "<b>Greetings, attached you will find the report from this week.</b>", // html body
      attachments: [
        {
          filename: `Weekly Time Report`,
          path: `http://165.22.188.206:1880/api/pdf/${result4.file}`,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = processWeeklyTimeReport;
