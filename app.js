const express = require("express");
require('dotenv').config();
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const mqtt = require("mqtt");
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);
mqttClient.on("connect", () => {
  console.log("🟢 Conectado al broker MQTT: "+process.env.MQTT_BROKER);
});

// Azure Blob config
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER
);
app.get("/", (req, res)=>res.json({message:'It is alive!'}));
app.post("/upload",upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No se adjuntó ninguna imagen");
  }
  const blobName = `${Date.now()}_${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadFile(file.path, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype, // <-- aquí se asigna el tipo real
      },
    });
    const publicUrl = `${blockBlobClient.url}`;


    mqttClient.publish(process.env.MQTT_TOPIC, publicUrl);
    console.log("🚀 URL publicada en MQTT:", process.env.MQTT_TOPIC);

    fs.unlinkSync(file.path); // borrar archivo local

    res.json({ ok: true, imageUrl: publicUrl});
  } catch (err) {
    console.error("❌ Error subiendo la imagen:", err.message);
    res.status(500).send("Error al subir imagen");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🌐 API escuchando en http://localhost:${process.env.PORT}`)
);