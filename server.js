import express from "express";
import fileUpload from "express-fileupload";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/submit", async (req, res) => {
  try {
    const { namn, personnummer, adress, email, telefon } = req.body;
    const file = req.files?.id_file;

    if (!file) {
      return res.status(400).json({ error: "Ingen ID-handling bifogad." });
    }

    // Generera unikt filnamn
    const fileName = `${uuidv4()}_${file.name}`;

    // Ladda upp till bucket "id-handlingar"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("id-handlingar")
      .upload(fileName, file.data, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: "Fel vid filuppladdning", details: uploadError });
    }

    const filePath = uploadData.path;

    // Spara inskickad data i "requests"-tabellen
    const { error: dbError } = await supabase.from("requests").insert([
      {
        namn,
        personnummer,
        adress,
        email,
        telefon,
        id_url: filePath,
        status: "mottagen",
        timestamp: new Date(),
      },
    ]);

    if (dbError) {
      return res.status(500).json({ error: "Fel vid databasinsättning", details: dbError });
    }

    res.status(200).json({ message: "Formulär mottaget" });
  } catch (err) {
    res.status(500).json({ error: "Något gick fel", details: err });
  }
});

app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
