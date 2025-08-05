
const express = require("express");
const fileUpload = require("express-fileupload");
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post("/submit", async (req, res) => {
    try {
        const { namn, personnummer, adress, email, telefon } = req.body;
        const file = req.files?.id_file;

        if (!file) return res.status(400).send("Ingen ID-fil bifogad.");

        const fileName = `${uuidv4()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("id_uploads")
            .upload(fileName, file.data, {
                contentType: file.mimetype,
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from("id_uploads")
            .getPublicUrl(fileName);

        const { error: insertError } = await supabase
            .from("requests")
            .insert([{
                namn,
                personnummer,
                adress,
                email,
                telefon,
                id_url: publicUrlData.publicUrl,
                status: "inlämnad",
                timestamp: new Date().toISOString()
            }]);

        if (insertError) throw insertError;

        res.send({ success: true, fileUrl: publicUrlData.publicUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send("Serverfel");
    }
});

app.listen(port, () => {
    console.log(`Servern körs på port ${port}`);
});
