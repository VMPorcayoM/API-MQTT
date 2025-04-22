# 📸 Image Uploader with Azure Blob Storage & MQTT Integration

This is a lightweight Express API that allows uploading images, storing them in **Azure Blob Storage**, and publishing their access links to an **MQTT topic** (e.g., using EMQX Cloud). It’s ideal for IoT scenarios where devices send captured images to the cloud and share their links over MQTT.

---

## 🚀 Features

- ✅ Upload images using `multipart/form-data`
- ☁️ Store images in Azure Blob Storage
- 🔐 Generate temporary access links (SAS URLs)
- 📡 Publish URLs to an MQTT topic
- 🧼 Automatically delete local files after uploading
- 🛡️ File validation (only image types, max 1MB)

---

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/VMPorcayoM/API-MQTT.git
cd API-MQTT