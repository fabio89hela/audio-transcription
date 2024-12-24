console.log("Upload-to-Drive function invoked");

const { google } = require("googleapis");
const { Readable } = require("stream");
const multiparty = require("multiparty");

const GOOGLE_CREDENTIALS = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Metodo non consentito" }),
        };
    }

    const form = new multiparty.Form();

    const parsedForm = await new Promise((resolve, reject) => {
        form.parse(event, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });

    const category = parsedForm.fields.category[0];
    const file = parsedForm.files.file[0];
    const folderId = {
        Emofilia: "1D-J3C13090LyeI4R7z6efTl-i1mMET7w",
        Oncoematologia: "1ZH6qclwImdNqKszb8YLhGUTLGDvnSzdg",
        Ematologia: "1IjvyszIgYwHm5ScDPxTWLWvh0wpuTAuX",
    }[category];

    const fileStream = Readable.from(file.buffer);

    try {
        const response = await drive.files.create({
            requestBody: {
                name: file.originalFilename,
                parents: [folderId],
            },
            media: {
                mimeType: file.headers["content-type"],
                body: fileStream,
            },
            fields: "id, webViewLink",
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ fileUrl: response.data.webViewLink }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
