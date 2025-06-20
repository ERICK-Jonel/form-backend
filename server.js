const express = require("express");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.json());

// (Opcional) Almacenar IDs ya usados para evitar replay
const usedIds = new Set();

app.post("/submit", async (req, res) => {
  const { submissionId, nombre, apellido, telefono, email, curso, terminos } = req.body;

  if (!submissionId || usedIds.has(submissionId)) {
    return res.status(400).json({ error: "Formulario ya enviado." });
  }
  usedIds.add(submissionId);

  if (!nombre || !apellido || !telefono || !email || !curso || !terminos) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

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
    await transporter.sendMail({
      from:    `"Web Inscripción" <${process.env.EMAIL_USER}>`,
      to:      process.env.RECEIVER_EMAIL,
      subject: "Nueva inscripción",
      html: `
        <p><b>Nombre:</b> ${nombre} ${apellido}</p>
        <p><b>Teléfono:</b> ${telefono}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Curso:</b> ${curso}</p>
      `
    });
    res.json({ message: "Enviado con éxito." });
  } catch (err) {
    console.error("Error enviando email:", err);
    res.status(500).json({ error: "Error al enviar correo." });
  }
});

const PORT = process.env.PORT || 3000;
app.get("/", (_, res) => res.send("OK"));
app.listen(PORT, () => console.log(`Server en ${PORT}`));
