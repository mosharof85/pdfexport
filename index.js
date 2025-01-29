const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

// Path to your Chrome/Chromium binary
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"; // Windows
// const CHROME_PATH = "/usr/bin/google-chrome"; // Linux
// const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // Mac

app.get("/pdf", async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send("URL is required as a query parameter");
    }

    let browser; // Declare browser outside try to access in catch
    try {
        // Launch Puppeteer with the specified Chrome binary
        browser = await puppeteer.launch({
            //executablePath: CHROME_PATH,
            headless: true, // Set to false for debugging
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        // Generate PDF with better quality (optional)
        const pdf = await page.pdf({
            format: "A4",
            printBackground: true, // Ensures backgrounds are printed
            scale: 1.2, // Improves clarity
        });

        const timestamp = Date.now();
        // const filename = `output-${timestamp}.pdf`;
        const filename = "output.pdf";

        await browser.close(); // Close browser before sending response

        // Set headers to display in browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        // res.setHeader("Content-Disposition", "inline");
        res.end(pdf, "binary"); // Send PDF as binary
    } catch (error) {
        if (browser) await browser.close(); // Ensure browser is closed on error
        res.status(500).send("Error generating PDF: " + error.message);
        // res.status(500).send("Error generating PDF");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

//http://localhost:3000/pdf?url=https://www.berglaessig-bodenmais.de/magazine/morgenpost/
