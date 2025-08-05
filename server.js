const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/submit", upload.single("id_file"), (req, res) => {
  const { name, email, personal_number, address, phone } = req.body;
  const idFile = req.file;

  console.log("Received submission:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Personal number:", personal_number);
  console.log("Address:", address);
  console.log("Phone:", phone);
  console.log("ID File:", idFile?.originalname);

  res.status(200).json({ message: "Form submission received!" });
});

app.get("/", (req, res) => {
  res.send("GDPR Form Backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
