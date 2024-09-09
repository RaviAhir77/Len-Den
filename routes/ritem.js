const puppeteer = require('puppeteer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Item = require('../model/item');
const express = require('express');

const router = express.Router();

// Upload file in local server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filepath = path.join(__dirname, '..', 'uploads', req.file.filename);

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://postimages.org', { waitUntil: 'networkidle2' });

        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click('#ddinput')
        ]);

        await fileChooser.accept([filepath]);

        await page.waitForSelector('#code_direct');
        const directLink = await page.$eval('#code_direct', el => el.value);

        await browser.close();

        fs.unlinkSync(filepath);

        const { heading, aboutItem, price, catogory, city, address } = req.body;
        const newItem = new Item({
            photo: directLink,
            heading,
            aboutItem,
            price,
            catogory,
            city,
            address,
            user: req.cookies.userId,
        });

        await newItem.save();
        res.redirect('/')
    } catch (error) {
        console.error(error);
        fs.unlinkSync(filepath);
        res.status(500).json({ error: 'There was a problem uploading the file'});
    }
});

module.exports = router;
