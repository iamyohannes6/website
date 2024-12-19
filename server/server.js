const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'iamyohannes6@outlook.com',
        pass: process.env.EMAIL_PASSWORD // We'll set this up in .env
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        await transporter.sendMail({
            from: 'iamyohannes6@outlook.com',
            to: 'iamyohannes6@outlook.com',
            subject: `Portfolio Contact: ${name}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
});

// Add endpoint to get images from a directory
app.get('/api/get-images', (req, res) => {
    const { directory } = req.query;
    if (!directory) {
        return res.status(400).json({ error: 'Directory parameter is required' });
    }

    const directoryPath = path.join(__dirname, '..', 'assets', 'work', directory);
    console.log('Searching for images in:', directoryPath);
    
    try {
        // Check if directory exists
        if (!fs.existsSync(directoryPath)) {
            console.error('Directory does not exist:', directoryPath);
            return res.status(404).json({ error: 'Directory not found' });
        }

        // Read directory and filter image files
        const files = fs.readdirSync(directoryPath);
        console.log('Files found:', files);

        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png'].includes(ext);
        });

        console.log('Image files found:', imageFiles);

        // Map files to their public URLs
        const imageUrls = imageFiles.map(file => `/assets/work/${directory}/${file}`);
        res.json(imageUrls);
    } catch (error) {
        console.error(`Error reading directory ${directory}:`, error);
        res.status(500).json({ error: 'Failed to read directory', details: error.message });
    }
});

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
