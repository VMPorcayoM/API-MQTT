require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mqtt = require("mqtt");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const upload = multer({ dest: "uploads/" });

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);
mqttClient.on("connect", () => {
  console.log("🟢 Conectado al broker MQTT");
});

// // Azure Blob config
// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   process.env.AZURE_STORAGE_CONNECTION_STRING
// );
// const containerClient = blobServiceClient.getContainerClient(
//   process.env.AZURE_CONTAINER
// );

app.post("/upload", async (req, res) => {
  const {publicUrl} = req.body;
  const blobName = `${Date.now()}`;
  // const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    // const uploadBlobResponse = await blockBlobClient.uploadFile(file.path);
    // const publicUrl = `${blockBlobClient.url}`;

    // console.log("📤 Imagen subida a:", publicUrl);

    mqttClient.publish(process.env.MQTT_TOPIC, publicUrl);
    console.log("🚀 URL publicada en MQTT:", process.env.MQTT_TOPIC);

    // fs.unlinkSync(file.path); // borrar archivo local

    res.json({ ok: true, imageUrl: publicUrl});
  } catch (err) {
    console.error("❌ Error subiendo la imagen:", err.message);
    res.status(500).send("Error al subir imagen");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🌐 API escuchando en http://localhost:${process.env.PORT}`)
);