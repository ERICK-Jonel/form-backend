// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.json());

// Memoria simple de submissionId ya procesados
const processedIds = new Set();

// Ruta Health Check
app.get("/", (req, res) => res.send("OK"));

// Endpoint /submit con chequeo de ID único
app.post("/submit", async (req, res) => {
  const {
    submissionId,
    nombre,
    apellido,
    telefono,
    email,
    curso,
    terminos,
  } = req.body;

  // Validar submissionId
  if (!submissionId) {
    return res.status(400).json({ error: "Falta submissionId." });
  }
  if (processedIds.has(submissionId)) {
    return res.status(400).json({ error: "Formulario ya enviado." });
  }
  processedIds.add(submissionId);

  // Validar campos obligatorios
  if (!nombre || !apellido || !telefono || !email || !curso || !terminos) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  // Configurar transporter Nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Envío de correo
    await transporter.sendMail({
      from: `"Web Inscripción" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: "Nueva inscripción",
      html: `
        <p><b>Nombre:</b> ${nombre} ${apellido}</p>
        <p><b>Teléfono:</b> ${telefono}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Curso:</b> ${curso}</p>
      `,
    });
    return res.json({ message: "Enviado con éxito." });
  } catch (err) {
    console.error("Error enviando email:", err);
    return res.status(500).json({ error: "Error al enviar correo." });
  }
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server en ${PORT}`));
