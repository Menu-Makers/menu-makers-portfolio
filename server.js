const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting Menu Makers server...');
console.log('📁 Current directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📧 Email user configured:', !!process.env.EMAIL_USER);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors());

// Rate limiting for contact form
const contactFormLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many contact form submissions from this IP, please try again later.'
    }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', contactFormLimit, async (req, res) => {
    try {
        const { name, email, subject, message, teamMember } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required fields.'
            });
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Determine recipient based on team member selection
        let recipientEmail;
        let recipientName;

        switch (teamMember) {
            case 'company':
                recipientEmail = 'menumakers17@gmail.com';
                recipientName = 'Menu Makers Company';
                break;
            case 'jatinder':
                recipientEmail = process.env.JATINDER_EMAIL || 'menumakers17@gmail.com';
                recipientName = 'Jatinder Kaur (Team Lead)';
                break;
            case 'mansi':
                recipientEmail = process.env.MANSI_EMAIL || 'menumakers17@gmail.com';
                recipientName = 'Mansi Keer (UI/UX Designer)';
                break;
            case 'madhusudan':
                recipientEmail = process.env.MADHUSUDAN_EMAIL || 'menumakers17@gmail.com';
                recipientName = 'Madhusudan Mainali (QA Specialist)';
                break;
            case 'ramesh':
                recipientEmail = process.env.RAMESH_EMAIL || 'menumakers17@gmail.com';
                recipientName = 'Ramesh Kumawat (Technical Lead)';
                break;
            default:
                recipientEmail = 'menumakers17@gmail.com';
                recipientName = 'Menu Makers Company';
        }

        // Email to selected team member/company
        const teamMailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #00cec9 0%, #00d4aa 50%, #55efc4 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
                    </div>
                    <div style="padding: 20px; background: #f8f9fa;">
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #2d5a4d;">
                                <strong>📧 Sent to:</strong> ${recipientName}<br>
                                <strong>🕒 Received at:</strong> ${new Date().toLocaleString()}
                            </p>
                        </div>
                        
                        <h2 style="color: #333;">Contact Details:</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Name:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Subject:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${subject || 'General Inquiry'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Contact Preference:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${recipientName}</td>
                            </tr>
                        </table>
                        
                        <h3 style="color: #333; margin-top: 20px;">Message:</h3>
                        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #00d4aa;">
                            <p style="margin: 0; line-height: 1.6;">${message}</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                <strong>📧 Reply directly to:</strong> ${email}<br>
                                <strong>💡 Tip:</strong> Click reply to respond directly to the customer
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Auto-reply to user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting Menu Makers!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #00cec9 0%, #00d4aa 50%, #55efc4 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Thank You!</h1>
                    </div>
                    <div style="padding: 20px; background: #f8f9fa;">
                        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for reaching out to <strong>Menu Makers</strong>! We've received your message and really appreciate you taking the time to contact us.
                        </p>
                        
                        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #00d4aa; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #333;">Your message has been sent to:</p>
                            <p style="margin: 10px 0 0 0; color: #555; font-weight: bold;">${recipientName}</p>
                        </div>
                        
                        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #333;">Your message:</p>
                            <p style="margin: 10px 0 0 0; color: #555; font-style: italic;">"${message}"</p>
                        </div>
                        
                        <p style="color: #555; line-height: 1.6;">
                            Our team will review your inquiry and get back to you within <strong>24-48 hours</strong>. 
                            If you have any urgent questions, feel free to reach out to us directly at <a href="mailto:menumakers17@gmail.com" style="color: #00d4aa;">menumakers17@gmail.com</a>.
                        </p>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #2d5a4d;">
                                <strong>🚀 What's next?</strong><br>
                                • We'll review your project requirements<br>
                                • Our team will prepare a detailed response<br>
                                • We'll contact you with next steps and timeline<br>
                                • You'll receive a follow-up within 24-48 hours
                            </p>
                        </div>
                        
                        <p style="color: #555;">
                            Best regards,<br>
                            <strong style="color: #00d4aa;">The Menu Makers Team</strong><br>
                            <a href="mailto:menumakers17@gmail.com" style="color: #666; font-size: 14px;">menumakers17@gmail.com</a>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 5px;">
                            <p style="margin: 0; color: #888; font-size: 14px;">
                                Follow us on our social media for updates and latest projects!
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send emails
        await transporter.sendMail(teamMailOptions);
        await transporter.sendMail(userMailOptions);

        console.log(`📧 Contact form submission sent to: ${recipientName} (${recipientEmail})`);

        res.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again later.'
        });
    }
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Menu Makers server running on port ${PORT}`);
    console.log(`📧 Email functionality enabled`);
    console.log(`🔗 Visit: http://localhost:${PORT}`);
    console.log(`📫 Company email: menumakers17@gmail.com`);
});
