require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

app.post('/submit', async (req, res) => {
  const { nombre, apellido, telefono, email, curso, terminos } = req.body;
  if (!nombre||!apellido||!telefono||!email||!curso||!terminos)
    return res.status(400).json({ error: 'Faltan campos.' });

  try {
    await transporter.sendMail({
      from: `"Web Inscrip" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: 'Nueva inscripción',
      html: `
        <p><b>Nombre:</b> ${nombre} ${apellido}</p>
        <p><b>Tel:</b> ${telefono}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Curso:</b> ${curso}</p>`
    });
    res.json({ message: 'Enviado con éxito' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al enviar' });
  }
});

app.get('/', (req, res) => res.send('OK'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server en ${PORT}`));

