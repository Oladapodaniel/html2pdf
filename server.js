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
    // const base64Pdf = pdfBuffer.toString('base64');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=document.pdf',
    });

    res.send(pdfBuffer);
    res.status(200).send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`PDF server running on http://localhost:${PORT}`));


const generatePdf = async (html) => {
  const response = await fetch('http://localhost:3001/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ html }),
  });

  if (!response.ok) {
    throw new Error('Error generating PDF');
  }

  const pdf = await response.blob();
  return pdf;
}

const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&display=swap"
        rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Outfit';
            src: url('./Outfit-Regular.ttf') format('opentype');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: 'Courier New';
            src: url('./cour.ttf') format('opentype');
            font-weight: normal;
            font-style: normal;
        }

        @font-face {
            font-family: 'Outfit-Bold';
            src:
                url('./Outfit-Bold.ttf') format('opentype');
            font-weight: bold;
            font-style: normal;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: "Outfit", Arial, sans-serif;
            color: #040404;
            padding: 2rem;
            font-size: 10pt;
            line-height: 22.5958px;
            margin-top: 0pt;
            margin-bottom: 8pt;
            font-kerning: none;
            font-variant-ligatures: none
        }

        h1 {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 72pt;
            font-weight: 700;
            line-height: 121px;
            margin-top: 36pt;
            margin-bottom: 18pt;
        }

        h2 {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 54pt;
            line-height: 91px;
            margin-top: 27pt;
            margin-bottom: 14pt;
        }

        h3 {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 36pt;
            line-height: 61px;
            margin-top: 27pt;
            margin-bottom: 14pt;
        }

        h4 {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 27pt;
            line-height: 46px;
            margin-top: 18pt;
            margin-bottom: 9pt;
        }

        h5 {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 18pt;
            line-height: 34.75px;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }

        h6,
        th {
            font-family: "Outfit-Bold", Arial, sans-serif;
            font-size: 10pt;
            line-height: 17px;
            margin-top: 0pt;
            margin-bottom: 8pt;
        }

        h1+p,
        h2+p,
        h3+p,
        h4+p,
        h5+p,
        h6+p {
            break-before: avoid-page;
            break-inside: avoid-page;
        }

        p+table,
        h1+table,
        h2+table,
        h3+table,
        h4+table,
        h5+table,
        h6+table {
            break-before: avoid-page;
            break-inside: avoid-page;
        }

        p {
            margin-top: 0pt;
            margin-bottom: 8pt;;
        }

        /* em {
            display: inline-block;
            text-align: center;
            margin: 18pt 0 18pt 0;
        } */

        pre {
            line-height: 15px;
            background: #eee;
            padding: 7px;
            margin: 18pt 0 18pt 1cm;
            border-radius: 8px;
            word-wrap: break-word;
            white-space: pre-wrap;
            break-before: avoid-page;
            break-inside: avoid-page;
        }

        code {
            font-family: 'Courier New', Courier, monospace;
        }

        ul,
        ol,
        li {
            margin-top: 0pt;
            margin-bottom: 8pt;

            line-height: 22.5958px;

        }

        ul,
        ol {
            list-style-type: disc;

            margin-left: 0.64cm;


            padding-left: 0;

        }

        ul ul,
        ol ol {
            list-style-type: disc;
            margin-left: 1.26cm;

        }


        ul ul ul,
        ol ol ol {
            list-style-type: disc;
            margin-left: 1.28cm;

        }


        ul ul ul ul,
        ol ol ol ol {
            list-style-type: disc;
            margin-left: 1.27cm;

        }

        ol {
            list-style-type: decimal;
        }

        ol ol {
            list-style-type: decimal;
        }


        li ul,
        li ol {
            margin-top: 8pt;
            margin-bottom: 0;
        }

        hr {
            margin: -9px 0 10px 0
        }



        table {
            width: 100%;
            border-collapse: separate;
            margin-bottom: 2em;
            background-color: #0000002e;
        }


        thead tr {
            background-color: #dedede;
            text-align: left;
            border-bottom: 1px solid #3333330e;
        }


        th {
            padding: 5px;
            text-align: left;
        }

        th,
        td {
            line-height: 21.2667px;
        }

        tbody tr {
            border-bottom: 1px solid #3333330e;
        }


        tbody tr:nth-child(even) {
            background-color: #f7f7f7;

        }

        tbody tr:nth-child(odd) {
            background-color: #ffffff;

        }


        td {
            padding: 5px;
            color: #040404;
            vertical-align: middle;
        }

        p:has(> img[alt="logo"]) {
            display: flex;
            justify-content: flex-end;
            width: 100%;
        }

        img[alt="logo"] {
            width: 4.11cm;
            height: 1.76cm;
        }
    </style>
</head>

<body>
    <p><img src="file:///Users/mac/Desktop/html/MACHINES_LIKE_ME_WHITE.svg" alt="logo" title="a title"></p>
    <h1 id="headline-1">Headline 1</h1>
    <h2 id="headline-2">Headline 2</h2>
    <h3 id="headline-3">Headline 3</h3>
    <h4 id="headline-4">Headline 4</h4>
    <h5 id="headline-5">Headline 5</h5>
    <h6 id="headline-6">Headline 6</h6>
    <p>Standard Text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elegant spacing, serif characters
        gracefully aligned, exuding clarity and understated sophistication. Margins balanced, text effortlessly flows,
        subtle harmony enhancing readability and professionalism. Finely tuned line heights create visual comfort,
        capturing tradition and <strong>fat</strong> text with <em>italic</em>. </p>
    <em>“Typography is the craft of endowing human language with a durable visual form. This is the craft of endowing
        human language with a durable visual form.”</em>
    <p>Standard Text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elegant spacing, serif characters
        gracefully aligned, exuding clarity and understated sophistication. Margins balanced, text effortlessly flows,
        subtle harmony enhancing readability and professionalism. Balanced, text effortlessly flows, subtle harmony
        enhancing and professionalism. Here is an<a href="http://www.google.com/"> URL</a> which links to<a
            href="http://www.google.com/"> http://www.google.com</a> , text effortlessly flows, subtle harmony enhancing
        readability and professionalism. Finely tuned line heights create visual comfort, capturing tradition and
        <strong>fat</strong> text with <em>italic and italic</em> <strong><em>fat</em></strong>.
    </p>
    <pre><code>// Codeblock This paragraph serves <span class="hljs-keyword">as</span> a sample text <span class="hljs-keyword">and</span> has no specific meaning.++ It <span class="hljs-keyword">is</span> used to test the formatting <span class="hljs-keyword">of</span> code blocks, particularly <span class="hljs-keyword">in</span> terms-- <span class="hljs-keyword">of</span> font style, size, <span class="hljs-keyword">and</span> line spacing. The goal <span class="hljs-keyword">is</span> to ensure <span class="hljs-keyword">that</span> all // settings are displayed <span class="hljs-keyword">in</span> a default <span class="hljs-keyword">and</span> neutral manner, without special // formatting <span class="hljs-keyword">such</span> <span class="hljs-keyword">as</span> bold, italics, <span class="hljs-keyword">or</span> indentation adjustments.. 
</code></pre>
    <p>Standard Text <code>Inline Code</code> consectetur adipiscing elit. Elegant spacing, serif characters gracefully
        aligned, exuding clarity and <code>understated</code> sophistication. Margins balanced, text effortlessly flows,
        subtle harmony enhancing <code>readability</code> and professionalism. Finely tuned line heights create visual
        comfort, capturing tradition and <strong>fat</strong> text with <em>italic</em>. </p>
    <ul>
        <li>
            <p>List Item enhancing readability and professionalism. Balanced, text effortlessly flows,
                subtle harmony enhancing and professionalism. Margins balanced, text effortlessly flows,
                subtle enhancing readability and professionalism</p>
        </li>
        <li>
            <p>Another List Item</p>
            <ul>
                <li>
                    Another Deeper List Item
                    <ul>
                        <li>
                            <p>Even Deeper</p>
                            <ul>
                                <li>Very deep list item</li>
                                <li>Very deep list item</li>
                                <li>Very deep list item</li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>
        </li>
        <li>
            <p>And another one</p>
        </li>
    </ul>
    <p>Standard Text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elegant spacing, serif characters
        gracefully aligned, exuding clarity and understated sophistication. Margins balanced, text effortlessly flows,
        subtle harmony enhancing Standard Text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elegant spacing,
        serif characters gracefully aligned, exuding clarity and understated sophistication. Margins balanced, text
        effortlessly flows, subtle harmony enhancing </p>
    <ol>
        <li>Numbered List Item 1 List Item enhancing readability and professionalism. Balanced, text effortlessly flows,
            subtle harmony enhancing and professionalism. Margins balanced, text effortlessly flows, subtle enhancing
            readability and professionalism </li>
        <li>Numbered List Item 2 List Item and professionalism. Balanced, text. Margins balanced, text effortlessly
            flows,
            subtle enhancing readability and professionalism
            <ol>
                <li>
                    <p>One level deeper </p>
                    <ol>
                        <li>
                            <p>Even Deeper </p>
                        </li>
                        <li>
                            <p>Even Deeper </p>
                        </li>
                    </ol>
                </li>

            </ol>
        </li>
    </ol>
    <h4>A headline breaks towards a new page if at least text line from the paragraph below doesnt fit
    </h4>
    <p>Standard Text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elegant spacing, serif characters
        gracefully aligned, exuding clarity and understated sophistication. Margins Standard Text Lorem ipsum dolor sit
        amet, consectetur adipiscing elit. Elegant spacing, serif characters gracefully aligned, exuding clarity and
        understated sophistication. Margins balanced, text effortlessly flows, subtle harmony enhancing. </p>
    <p>A Line: </p>
    <hr />
    <p>Normal Table </p>
    <table>
        <thead>
            <tr>
                <th>Sample Table Headline</th>
                <th>Another One</th>
                <th>Another</th>
                <th>And another</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Test Value of a table line content to show that it also works with two lines</td>
                <td>Content</td>
                <td>Also here</td>
                <td>Left Aligned</td>
            </tr>
            <tr>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
            </tr>
            <tr>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
            </tr>
            <tr>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
                <td>asdaas</td>
            </tr>
        </tbody>
    </table>
    <p>Financial Table </p>
    <table>
        <thead>
            <tr>
                <th>Sample Table Headline</th>
                <th>Another One</th>
                <th>Another</th>
                <th style="text-align:right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Test</td>
                <td>Here</td>
                <td>Also</td>
                <td style="text-align:right">654 €</td>
            </tr>
            <tr>
                <td>Further</td>
                <td>Here</td>
                <td>Also</td>
                <td style="text-align:right">1.654 €</td>
            </tr>
            <tr>
                <td>Further</td>
                <td>Here</td>
                <td>Also</td>
                <td style="text-align:right">1.654 €</td>
            </tr>
            <tr>
                <td>Further</td>
                <td>Here</td>
                <td>Also</td>
                <td style="text-align:right">1.654 €</td>
            </tr>
        </tbody>
    </table>
    <p>NOTE FOR CSS DEVELOPER: THESE LINE ITEMS COULD LOOK BETTER IF THE DISTANCE BETWEEN THEM WOULD BE A BIT SMALLER
        AND IF INFRONT OF IT AND AT THE END OF THE LIST THERE WOULD BE A BIT MORE DISTANCE FROM THE STANDARD TEXT TABLES
        (if not too long) and Headlines should start at a new page. The page break should keep a headline and the next
        paragraph together (in case of headline) \
        Table distance between two text lines is too big in the sample here. Perhaps you can make that text look a bit
        better. </p>
    <hr>
</body>

<script>

    function targetPBeforeTables() {
        var tables = document.querySelectorAll('table');

        tables.forEach(function (table) {
            // Get the previous sibling
            var prevSibling = table.previousElementSibling;

            if (prevSibling && prevSibling.tagName === 'P') {
                prevSibling.style.marginTop = '40px';
            }
        });
    }
    targetPBeforeTables();


    function targetEmElements(startsWith) {
        // Select all em elements
        var emElements = document.querySelectorAll('em');

        emElements.forEach(function (em) {
            if (em.textContent.trim().startsWith(startsWith)) {
                em.style.textAlign = 'center';
                em.style.display = 'inline-block';
                em.style.marginTop = '18pt'
                em.style.marginBottom = '18pt'
            }
        });
    }
    

</script>

</html>`
// generatePdf(html).then(pdf => {
//     const url = URL.createObjectURL(pdf);
//     // window.open(url, '_blank');
//     console.log('PDF generated:', url, pdf);
//     }
// );