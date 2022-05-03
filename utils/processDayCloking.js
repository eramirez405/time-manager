const fetch = require("node-fetch");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const download = require("download");
const format = require("date-fns/format");

async function processDayCloking() {
  try {
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

    const result3 = await fetch("http://165.22.188.206:1880/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "http://165.227.93.101:5000/api/timelog/report/dayReport",
        landscape: true,
      }),
    });

    const result4 = await result3.json();
    // se descarga el archivo y se pasa a una carpeta
    fs.writeFileSync(
      "reports/test.pdf",
      await download(`http://165.22.188.206:1880/api/pdf/${result4.file}`)
    );
    // se elimina despues de un minuto.
    if (fs.existsSync("reports/test.pdf")) {
      console.log("archivo descargado");
      setTimeout(async () => {
        fs.unlinkSync("reports/test.pdf");
      }, 60000);
    }
    // se nombra el archivo para google drive
    let fileMetadata = {
      name: `Reporte Diario ${format(new Date(), "d/MM/yyyy")}.pdf`,
      //nota el parenst se saca dando click en la carpeta de google drive
      // en el link de arriba lo sacan como el ejemplo de abajo
      //https://drive.google.com/drive/u/5/folders/1_bdBUTS21EJrTQa8zQkGRZph5HlGMFJo
      parents: ["1_bdBUTS21EJrTQa8zQkGRZph5HlGMFJo"],
    };
    // se prepara el archivo
    let media = {
      mimeType: "application/pdf",
      body: fs.createReadStream("reports/test.pdf"),
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
  } catch (error) {
    console.log(error);
  }
}

module.exports = processDayCloking;
