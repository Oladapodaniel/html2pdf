const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // allow large HTML

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) return res.status(400).send('No HTML provided');

  try {
    const browser = await puppeteer.launch({ 
        headless: 'new' ,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in'
      }
    });

    await browser.close();

    // 1) Convert Buffer -> Base64
    const base64Pdf = pdfBuffer.toString('base64');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=document.pdf',
    });

    res.send(base64Pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`PDF server running on http://localhost:${PORT}`));
