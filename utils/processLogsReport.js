const nodemailer = require("nodemailer");
const config = require("config");
const emailUser = config.get("EMAIL_USER");
const emailPass = config.get("EMAIL_PASS");
const fetch = require("node-fetch");

const AuthUser = require("../models/AuthUser");


async function processLogsReport() {
    try {
      
      const result3 = await fetch("http://165.227.93.101:5000/api/timelog/report/dayLogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   url: "http://165.227.93.101:5000/api/timelog/report/reportagentsMonth",
        //   landscape: true,
        // }),
      });
  
      
    } catch (error) {
      console.log(error);
    }
  }
  
  module.exports = processLogsReport;
  
