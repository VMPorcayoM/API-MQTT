const express = require("express");
require('dotenv').config();
const multer = require("multer");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const fs = require("fs");
const { BlobServiceClient } = require("@azure/storage-blob");
const { generateSasUrl } = require("./services/services");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 🔐 Configuración segura para EMQX Cloud
const mqttOptions = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
};
// Conexión segura TLS
const mqttClient = mqtt.connect(`${process.env.MQTT_BROKER}":"${process.env.MQTT_PORT}`, mqttOptions);

mqttClient.on("connect", () => {
  console.log("🟢 Conectado a broker");
});
mqttClient.on("error", (err) => {
  console.error("❌ Error de conexión MQTT:", err.message);
});

const upload = multer({ 
  dest: "uploads/", 
  limits: { fileSize: 4 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(null, false);
    cb(null, true);
  }
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
  if (!file)
    return res.status(400).send("No se adjuntó ninguna imagen");
  if (!file.mimetype.startsWith("image/"))
    return res.status(400).send("Solo se permiten imágenes");
  if (file.size > 2 * 1024 * 1024)
    return res.status(400).send("La imagen es demasiado grande");

  const blobName = `${Date.now()}_${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadFile(file.path, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype, // <-- aquí se asigna el tipo real
      },
    });
    const sasUrl = generateSasUrl(process.env.AZURE_CONTAINER, blobName);

    mqttClient.publish(process.env.MQTT_TOPIC, sasUrl, { retain: true });

    fs.unlinkSync(file.path); // borrar archivo local

    res.json({ ok: true, imageUrl: sasUrl});
  } catch (err) {
    console.error("Error subiendo la imagen:", err.message);
    res.status(500).send("Error al subir imagen");
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🌐 API escuchando en http://localhost:${process.env.PORT}`)
);