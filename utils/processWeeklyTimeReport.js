const nodemailer = require("nodemailer");
const config = require("config");
const emailUser = config.get("EMAIL_USER");
const emailPass = config.get("EMAIL_PASS");
const fetch = require("node-fetch");
const AuthUser = require("../models/AuthUser");
const { google } = require("googleapis");
const download = require("download");
const format = require("date-fns/format");
const fs = require("fs");
const c = require("config");
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function processWeeklyTimeReport() {
  try {
    const users = await AuthUser.find({ timeManage: true });

    const _leads = users.filter((e) => e.role === "lead");
    //  account key file from google cloud console
    const KEYFILEPATH = "docs/senddatatodrive-e46a6e69afae.json";
    // drive scope  for full acces to google drive account
    const SCOPES = ["https://www.googleapis.com/auth/drive"];
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
    // servicio de google drive
    const driveService = google.drive({ version: "v3", auth });
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
        type: "login",
        user: emailUser,
        pass: emailPass,
      },
    });
    // se descarga el archivo y se pasa a una carpeta
    fs.writeFileSync(
      "reports/ReporteSemanalParaPamela.pdf",
      await download(`http://165.22.188.206:1880/api/pdf/${result2.file}`)
    );
    // se elimina despues de un minuto.
    if (fs.existsSync("reports/ReporteSemanalParaPamela.pdf")) {
      console.log("archivo descargado");
      setTimeout(async () => {
        fs.unlinkSync("reports/ReporteSemanalParaPamela.pdf");
      }, 60000);
    }
    // se nombra el archivo para google drive
    let fileMetadata = {
      name: `Reporte Semanal Pamela ${format(new Date(), "d/MM/yyyy")}.pdf`,
      //nota el parenst se saca dando click en la carpeta de google drive
      // en el link de arriba lo sacan como el ejemplo de abajo
      //https://drive.google.com/drive/u/5/folders/1_bdBUTS21EJrTQa8zQkGRZph5HlGMFJo
      parents: ["1I7I711LGH8VWrOF4VaUwVODckLcTFP-O"],
    };
    // se prepara el archivo
    let media = {
      mimeType: "application/pdf",
      body: fs.createReadStream("reports/ReporteSemanalParaPamela.pdf"),
    };
    // se crea el archivo en google drive
    let response = await driveService.files.create({
      resource: fileMetadata,
      media: await media,
      fields: "id",
    });

    switch (response.status) {
      case 200:
        console.log(" File created", response.data.id);
        break;
    }
    // let info1 = await transporter.sendMail({
    //   from: '"Michael Castillo" <michael@ualett.com>', // sender address
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
    // se descarga el archivo y se pasa a una carpeta
    fs.writeFileSync(
      "reports/ReporteSemanal.pdf",
      await download(`http://165.22.188.206:1880/api/pdf/${result4.file}`)
    );
    // se elimina despues de un minuto.
    if (fs.existsSync("reports/ReporteSemanal.pdf")) {
      console.log("archivo descargado");
      setTimeout(async () => {
        fs.unlinkSync("reports/ReporteSemanal.pdf");
      }, 60000);
    }
    // se nombra el archivo para google drive
    let fileMetadata2 = {
      name: `Reporte Semanal ${format(new Date(), "d/MM/yyyy")}.pdf`,
      //nota el parenst se saca dando click en la carpeta de google drive
      // en el link de arriba lo sacan como el ejemplo de abajo
      //https://drive.google.com/drive/u/5/folders/1_bdBUTS21EJrTQa8zQkGRZph5HlGMFJo
      parents: ["1G3o6fWJ2YVOF6Z8LFX6Td5JHRe9V-_cO"],
    };
    // se prepara el archivo
    let media2 = {
      mimeType: "application/pdf",
      body: fs.createReadStream("reports/ReporteSemanal.pdf"),
    };
    // se crea el archivo en google drive
    let response2 = await driveService.files.create({
      resource: fileMetadata2,
      media: await media2,
      fields: "id",
    });

    switch (response2.status) {
      case 200:
        console.log(" File created", response.data.id);
        break;
    }
    // let info2 = await transporter.sendMail({
    //   from: '"Michael Castillo" <michael@ualett.com>', // sender address
    //   to:
    //     "erasmo@ualett.com, cabrera@ualett.com, oscar@ualett.com, michael@ualett.com, julio.alvarez@ualett.com, msanz@ualett.com, ricky@ualett.com", // list of receivers
    //   subject: "Weekly Time Report", // Subject line
    //   html:
    //     "<b>Greetings, attached you will find the report from this week.</b>", // html body
    //   attachments: [
    //     {
    //       filename: `Weekly Time Report`,
    //       path: `http://165.22.188.206:1880/api/pdf/${result4.file}`,
    //       contentType: "application/pdf",
    //     },
    //   ],
    // });

    await asyncForEach(_leads, async (item) => {
      const _agents = users
        .filter((e) => e.department === item.department)
        .map((e) => e.email);

      const result5 = await fetch("http://165.22.188.206:1880/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `http://165.227.93.101:5000/api/timelog/report/agents/[${_agents}]`,
          landscape: true,
        }),
      });
      const result6 = await result5.json();
      const Lideres = {
        "leny@ualett.com": "1HoGfa9MwHpFEHEPpu0Gp8YoPLZcQZccz",
        "belyini@ualett.com": "177Ic0xw6jL5Nb_vyyreDiJDSCYKaqidf",
        "chaiana@ualett.com": "1tlo2IM4vTDIoxxlYtn5qmV2-wpEKTtS9",
        "palmira@ualett.com": "1fkUankoKVL2iu_gglcrs75CgfTnPJeQP",
      };
      const NombreArchivo = {
        "leny@ualett.com": "ReporteSemanalLeny",
        "belyini@ualett.com": "ReporteSemanalBelyini",
        "chaiana@ualett.com": "ReporteSemanalChaiana",
        "palmira@ualett.com": "ReporteSemanalPalmira",
      };
      // se descarga el archivo y se pasa a una carpeta
      fs.writeFileSync(
        `reports/${NombreArchivo[item.email]}.pdf`,
        await download(`http://165.22.188.206:1880/api/pdf/${result6.file}`)
      );
      // se elimina despues de un minuto.
      if (fs.existsSync(`reports/${NombreArchivo[item.email]}.pdf`)) {
        console.log("archivo descargado");
        setTimeout(async () => {
          fs.unlinkSync(`reports/${NombreArchivo[item.email]}.pdf`);
        }, 2000);
      }
      if (fs.existsSync("reports/ReporteSemanalL.pdf")) {
        console.log("archivo descargado");
        setTimeout(async () => {
          fs.unlinkSync("reports/ReporteSemanalL.pdf");
        }, 2000);
      }
      // se nombra el archivo para google drive

      let fileMetadata3 = {
        name: `Reporte Semanal ${format(new Date(), "d/MM/yyyy")}.pdf`,
        //nota el parenst se saca dando click en la carpeta de google drive
        // en el link de arriba lo sacan como el ejemplo de abajo
        //https://drive.google.com/drive/u/5/folders/1_bdBUTS21EJrTQa8zQkGRZph5HlGMFJo

        parents: [`${Lideres[item.email]}`],
      };
      // // se prepara el archivo
      let media3 = {
        mimeType: "application/pdf",
        body: fs.createReadStream(`reports/${NombreArchivo[item.email]}.pdf`),
      };
      // // se crea el archivo en google drive
      let response3 = await driveService.files.create({
        resource: fileMetadata3,
        media: await media3,
        fields: "id",
      });

      switch (response3.status) {
        case 200:
          console.log(" File created", response.data.id);
          break;
      }

      // let info3 = await transporter.sendMail({
      //   from: '"Michael Castillo" <michael@ualett.com>', // sender address
      //   to: item.email, // list of receivers
      //   subject: "Weekly Time Report", // Subject line
      //   html:
      //     "<b>Greetings, attached you will find the report from this week of your team.</b>", // html body
      //   attachments: [
      //     {
      //       filename: `Weekly Time Report`,
      //       path: `http://165.22.188.206:1880/api/pdf/${result6.file}`,
      //       contentType: "application/pdf",
      //     },
      //   ],
      // });
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = processWeeklyTimeReport;
