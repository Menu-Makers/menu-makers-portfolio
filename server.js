// Menu Makers Portfolio Server with Database Integration
console.log('🚀 Starting Menu Makers Portfolio with Database...');

require('dotenv').config();

// Environment variables helper - handle both cases
const getEnvVar = (name) => {
  return process.env[name] || process.env[name.toLowerCase()];
};

console.log('✅ Environment loaded');
console.log('Email user:', getEnvVar('EMAIL_USER'));
console.log('Email pass length:', getEnvVar('EMAIL_PASS') ? getEnvVar('EMAIL_PASS').length : 'undefined');

// Database setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database
const dbPath = path.join(__dirname, 'client_inquiries.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('📊 Connected to SQLite database');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS client_inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            team_member TEXT,
            inquiry_type TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            responded_at DATETIME,
            notes TEXT,
            ip_address TEXT,
            user_agent TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating client_inquiries table:', err.message);
        } else {
            console.log('✅ Client inquiries table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS client_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inquiry_id INTEGER,
            interaction_type TEXT,
            interaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            follow_up_required BOOLEAN DEFAULT 0,
            follow_up_date DATETIME,
            FOREIGN KEY (inquiry_id) REFERENCES client_inquiries (id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating client_interactions table:', err.message);
        } else {
            console.log('✅ Client interactions table ready');
        }
    });

    // Create admin users table for authentication
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating admin_users table:', err.message);
        } else {
            console.log('✅ Admin users table ready');
            
            // Insert default admin user if not exists
            db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'], (err, row) => {
                if (err) {
                    console.error('❌ Error checking admin user:', err.message);
                } else if (!row) {
                    // Create default admin user (password: Menumakers2025)
                    const defaultPassword = 'Menumakers2025';
                    db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', 
                        ['admin', defaultPassword], (err) => {
                        if (err) {
                            console.error('❌ Error creating default admin user:', err.message);
                        } else {
                            console.log('✅ Default admin user created (username: admin, password: Menumakers2025)');
                        }
                    });
                }
            });
        }
    });
});

console.log('📊 Database initialization complete');

try {
    // Import both Nodemailer and SendGrid
    const nodemailer = require('nodemailer');
    const sgMail = require('@sendgrid/mail');
    console.log('✅ Email libraries imported');

    // Configure email service based on environment
    let emailService = null;
    let transporter = null;

    if (process.env.NODE_ENV === 'production' && getEnvVar('SENDGRID_API_KEY')) {
        // Use SendGrid for production
        sgMail.setApiKey(getEnvVar('SENDGRID_API_KEY'));
        emailService = 'sendgrid';
        console.log('✅ SendGrid configured for production');
    } else {
        // Use Gmail for development
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: getEnvVar('EMAIL_USER'),
                pass: getEnvVar('EMAIL_PASS')
            }
        });
        emailService = 'gmail';
        console.log('✅ Gmail transporter configured for development');
    }

    console.log(`📧 Email service: ${emailService}`);

    // Universal email sending function with anti-spam improvements
    async function sendEmail(mailOptions) {
        try {
            if (emailService === 'sendgrid') {
                // SendGrid format with anti-spam improvements
                const sendGridMessage = {
                    to: mailOptions.to,
                    from: {
                        email: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com',
                        name: 'Menu Makers'
                    },
                    replyTo: {
                        email: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com',
                        name: 'Menu Makers Support'
                    },
                    subject: mailOptions.subject,
                    html: mailOptions.html,
                    // Anti-spam improvements
                    categories: ['contact-form', 'business-inquiry'],
                    customArgs: {
                        source: 'contact-form',
                        version: '1.0'
                    },
                    // Text version for better deliverability
                    text: mailOptions.text || mailOptions.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
                    // Tracking settings
                    trackingSettings: {
                        clickTracking: {
                            enable: false
                        },
                        openTracking: {
                            enable: false
                        }
                    },
                    // Mail settings for better delivery
                    mailSettings: {
                        sandboxMode: {
                            enable: false
                        },
                        spamCheck: {
                            enable: true,
                            threshold: 1
                        }
                    }
                };
                
                console.log('📧 Sending email via SendGrid with anti-spam settings...');
                await sgMail.send(sendGridMessage);
                console.log('✅ Email sent successfully via SendGrid');
            } else {
                // Nodemailer format with anti-spam improvements
                const enhancedMailOptions = {
                    ...mailOptions,
                    // Add text version for better deliverability
                    text: mailOptions.text || mailOptions.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
                    // Add proper headers
                    headers: {
                        'X-Priority': '3',
                        'X-MSMail-Priority': 'Normal',
                        'Importance': 'Normal',
                        'List-Unsubscribe': '<mailto:unsubscribe@menumakers17.gmail.com>',
                        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
                        'X-Mailer': 'Menu Makers Contact System'
                    },
                    // Proper reply-to
                    replyTo: mailOptions.replyTo || getEnvVar('EMAIL_USER'),
                    // Message ID for tracking
                    messageId: mailOptions.messageId
                };
                
                console.log('📧 Sending email via Gmail with anti-spam settings...');
                await transporter.sendMail(enhancedMailOptions);
                console.log('✅ Email sent successfully via Gmail');
            }
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            throw error;
        }
    }

    // Setup Express with static files
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');
    const session = require('express-session');
    
    const app = express();
    
    // Set trust proxy for production (needed for rate limiting and IP detection)
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    
    // GLOBAL NO-CACHE MIDDLEWARE - Force real-time loading for EVERYTHING
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', ''); // Disable ETag completely
        console.log(`🚫 NO-CACHE applied to: ${req.url}`);
        next();
    });
    
    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'menumakers-super-secret-key-2024',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
    
    // Security middleware (CSP disabled for debugging)
    app.use(helmet({
        contentSecurityPolicy: false,  // Disable CSP temporarily
    }));

    app.use(cors());

    // Rate limiting for contact form
    const contactFormLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 requests per windowMs
        message: 'Too many contact form submissions, please try again later.'
    });

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Serve static files from public directory with NO CACHING
    app.use(express.static(path.join(__dirname, 'public'), {
        setHeaders: (res, path) => {
            // DISABLE ALL CACHING - Force real-time loading
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Last-Modified', new Date().toUTCString());
            res.setHeader('ETag', ''); // Disable ETag
            console.log(`🚫 No-cache serving: ${path}`);
        }
    }));
    
    // Explicitly serve images directory with NO CACHING
    app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
        setHeaders: (res, path) => {
            // Set proper content type for images
            if (path.endsWith('.png')) {
                res.setHeader('Content-Type', 'image/png');
            } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
                res.setHeader('Content-Type', 'image/jpeg');
            } else if (path.endsWith('.svg')) {
                res.setHeader('Content-Type', 'image/svg+xml');
            }
            // DISABLE ALL CACHING FOR IMAGES TOO
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('ETag', ''); // Disable ETag
            console.log(`📸 No-cache serving image: ${path}`);
        }
    }));

    // Authentication middleware
    function requireAuth(req, res, next) {
        if (req.session && req.session.adminLoggedIn) {
            return next();
        } else {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
    }

    // Cache prevention middleware for admin routes
    app.use('/admin*', (req, res, next) => {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString(),
            'ETag': false
        });
        next();
    });

    // Cache prevention for API routes
    app.use('/api*', (req, res, next) => {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        next();
    });

    // Debug route to check image availability
    app.get('/api/debug/images', (req, res) => {
        const fs = require('fs');
        const imagesPath = path.join(__dirname, 'public', 'images');
        
        try {
            const files = fs.readdirSync(imagesPath);
            const imageFiles = files.filter(file => 
                file.toLowerCase().endsWith('.png') || 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg') || 
                file.toLowerCase().endsWith('.svg')
            );
            
            console.log('📸 Available images:', imageFiles);
            
            // Check specific avatar files
            const avatarFiles = [
                'jatinder image.png',
                'mansi-image.jpg', 
                'madhusudan image.jpeg',
                'ramesh-image.png'
            ];
            
            const avatarStatus = {};
            avatarFiles.forEach(filename => {
                const filePath = path.join(imagesPath, filename);
                try {
                    const stats = fs.statSync(filePath);
                    avatarStatus[filename] = {
                        exists: true,
                        size: stats.size,
                        readable: fs.accessSync(filePath, fs.constants.R_OK) === undefined
                    };
                } catch (error) {
                    avatarStatus[filename] = {
                        exists: false,
                        error: error.message
                    };
                }
            });
            
            res.json({
                success: true,
                imagesPath: imagesPath,
                availableImages: imageFiles,
                totalFiles: files.length,
                imageCount: imageFiles.length,
                avatarStatus: avatarStatus,
                serverUrl: `http://localhost:3000/images/`,
                testUrls: avatarFiles.map(file => `http://localhost:3000/images/${encodeURIComponent(file)}`)
            });
        } catch (error) {
            console.error('❌ Error reading images directory:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Test route for individual image
    app.get('/api/test/image/:filename', (req, res) => {
        const filename = req.params.filename;
        const imagePath = path.join(__dirname, 'public', 'images', filename);
        const fs = require('fs');
        
        try {
            if (fs.existsSync(imagePath)) {
                const stats = fs.statSync(imagePath);
                res.json({
                    success: true,
                    filename: filename,
                    exists: true,
                    size: stats.size,
                    path: imagePath,
                    url: `/images/${filename}`,
                    encodedUrl: `/images/${encodeURIComponent(filename)}`
                });
            } else {
                res.json({
                    success: false,
                    filename: filename,
                    exists: false,
                    path: imagePath
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                filename: filename
            });
        }
    });

    // Login endpoint
    app.post('/api/admin/login', async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            // Check user credentials
            db.get('SELECT * FROM admin_users WHERE username = ? AND is_active = 1', 
                [username], (err, user) => {
                if (err) {
                    console.error('❌ Login database error:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                if (!user || user.password !== password) {
                    console.log(`🚫 Failed login attempt for username: ${username}`);
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }

                // Successful login
                req.session.adminLoggedIn = true;
                req.session.adminUsername = username;
                req.session.adminId = user.id;

                // Update last login
                db.run('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', 
                    [user.id], (err) => {
                    if (err) {
                        console.error('❌ Error updating last login:', err.message);
                    }
                });

                console.log(`✅ Successful login for username: ${username}`);

                res.json({
                    success: true,
                    message: 'Login successful',
                    username: username
                });
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    });

    // Logout endpoint
    app.post('/api/admin/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error logging out'
                });
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    });

    // Check authentication status
    app.get('/api/admin/auth-status', (req, res) => {
        if (req.session && req.session.adminLoggedIn) {
            res.json({
                success: true,
                authenticated: true,
                username: req.session.adminUsername
            });
        } else {
            res.json({
                success: true,
                authenticated: false
            });
        }
    });

    // Contact form endpoint with database storage
    app.post('/api/contact', contactFormLimit, async (req, res) => {
        console.log('📧 Contact form submission received');
        console.log('🔍 Environment status:', {
            EMAIL_USER: !!process.env.EMAIL_USER,
            EMAIL_PASS: !!process.env.EMAIL_PASS,
            SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
            NODE_ENV: process.env.NODE_ENV,
            emailService: emailService
        });
        
        try {
            const { name, email, subject, message, teamMember } = req.body;

            // Validate required fields
            if (!name || !email || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and message are required fields.'
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address.'
                });
            }

            // Store inquiry in database first
            const inquiryData = {
                name,
                email,
                phone: req.body.phone || null,
                subject: subject || 'General Inquiry',
                message,
                team_member: teamMember || 'company',
                inquiry_type: teamMember === 'company' ? 'general' : 'team_specific',
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.get('User-Agent')
            };

            // Insert inquiry into database
            const insertInquiry = new Promise((resolve, reject) => {
                const stmt = db.prepare(`
                    INSERT INTO client_inquiries 
                    (name, email, phone, subject, message, team_member, inquiry_type, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                
                stmt.run([
                    inquiryData.name,
                    inquiryData.email,
                    inquiryData.phone,
                    inquiryData.subject,
                    inquiryData.message,
                    inquiryData.team_member,
                    inquiryData.inquiry_type,
                    inquiryData.ip_address,
                    inquiryData.user_agent
                ], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
                
                stmt.finalize();
            });

            const inquiryId = await insertInquiry;
            console.log(`📊 Inquiry stored in database with ID: ${inquiryId}`);

            // Send all inquiries to your main Gmail address
            let recipientEmail = 'menumakers17@gmail.com';
            let recipientName = 'Menu Makers Team';

            // Optional: You can still track which team member was selected for reference
            let selectedTeamMember = 'Menu Makers Company';
            switch (teamMember) {
                case 'jatinder':
                    selectedTeamMember = 'Jatinder Kaur';
                    break;
                case 'mansi':
                    selectedTeamMember = 'Mansi Keer';
                    break;
                case 'madhusudan':
                    selectedTeamMember = 'Madhusudan Mainali';
                    break;
                case 'ramesh':
                    selectedTeamMember = 'Ramesh Kumawat';
                    break;
                default:
                    selectedTeamMember = 'Menu Makers Company';
            }

            // Enhanced email to your Gmail with anti-spam improvements
            const teamMailOptions = {
                from: {
                    name: 'Menu Makers Contact System',
                    address: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com'
                },
                to: recipientEmail,
                replyTo: {
                    name: name,
                    address: email
                },
                subject: `New Business Inquiry #${inquiryId} - ${subject || 'General Inquiry'}`,
                text: `
New Client Inquiry #${inquiryId}

Client Information:
Name: ${name}
Email: ${email}
Subject: ${subject || 'General Inquiry'}
Originally requested: ${selectedTeamMember}
Inquiry ID: #${inquiryId}

Message:
${message}

Reply to: ${email}
Received: ${new Date().toLocaleString()}
Reference: #${inquiryId}

--
Menu Makers - Professional Web Development Services
Contact: menumakers17@gmail.com
                `,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Business Inquiry</h1>
                            <p style="color: #ecf0f1; margin: 5px 0 0 0; font-size: 14px;">Reference #${inquiryId}</p>
                        </div>
                        <div style="padding: 25px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                                <h2 style="color: #2c3e50; margin-top: 0; font-size: 18px;">Client Information</h2>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr style="border-bottom: 1px solid #ecf0f1;"><td style="padding: 8px 0; font-weight: 600; color: #34495e;">Name:</td><td style="padding: 8px 0; color: #2c3e50;">${name}</td></tr>
                                    <tr style="border-bottom: 1px solid #ecf0f1;"><td style="padding: 8px 0; font-weight: 600; color: #34495e;">Email:</td><td style="padding: 8px 0; color: #2c3e50;">${email}</td></tr>
                                    <tr style="border-bottom: 1px solid #ecf0f1;"><td style="padding: 8px 0; font-weight: 600; color: #34495e;">Subject:</td><td style="padding: 8px 0; color: #2c3e50;">${subject || 'General Inquiry'}</td></tr>
                                    <tr style="border-bottom: 1px solid #ecf0f1;"><td style="padding: 8px 0; font-weight: 600; color: #34495e;">Originally requested:</td><td style="padding: 8px 0; color: #e67e22; font-weight: 600;">${selectedTeamMember}</td></tr>
                                    <tr><td style="padding: 8px 0; font-weight: 600; color: #34495e;">Reference:</td><td style="padding: 8px 0; color: #2c3e50;">#${inquiryId}</td></tr>
                                </table>
                            </div>
                            
                            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #27ae60;">
                                <h3 style="color: #2c3e50; margin-top: 0; font-size: 16px;">Client Message:</h3>
                                <p style="line-height: 1.6; margin: 0; color: #2c3e50; background: #f8f9fa; padding: 15px; border-radius: 4px;">${message}</p>
                            </div>
                            
                            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; margin-top: 20px;">
                                <h4 style="margin: 0 0 10px 0; color: #27ae60; font-size: 14px;">📧 Quick Actions</h4>
                                <p style="margin: 0; font-size: 14px; color: #2c3e50;"><strong>Reply to:</strong> <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a></p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #2c3e50;"><strong>🕒 Received:</strong> ${new Date().toLocaleString()}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #2c3e50;"><strong>🔢 Reference:</strong> #${inquiryId}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #2c3e50;"><strong>📋 Team Request:</strong> ${selectedTeamMember}</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                                <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Menu Makers - Professional Web Development Services</p>
                                <p style="margin: 5px 0 0 0; font-size: 12px;"><a href="mailto:menumakers17@gmail.com" style="color: #3498db; text-decoration: none;">menumakers17@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                `,
                messageId: `inquiry-${inquiryId}-${Date.now()}@menumakers.com`,
                priority: 'normal'
            };

            // Enhanced confirmation email to user with anti-spam improvements
            const userMailOptions = {
                from: {
                    name: 'Menu Makers Support Team',
                    address: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com'
                },
                to: {
                    name: name,
                    address: email
                },
                replyTo: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com',
                subject: `Thank you for contacting Menu Makers - Confirmation #${inquiryId}`,
                text: `
Hi ${name},

Thank you for reaching out to Menu Makers! We have received your inquiry and assigned it reference number #${inquiryId}.

Your inquiry details:
Reference: #${inquiryId}
Subject: ${subject || 'General Inquiry'}
Assigned to: ${recipientName}

Your message: "${message}"

What happens next?
- We will review your inquiry within 24-48 hours
- Our team will prepare a detailed response
- You will receive a follow-up email with next steps

Please save your reference number #${inquiryId} for future correspondence.

Best regards,
The Menu Makers Team
Email: menumakers17@gmail.com
Website: https://menu-makers-portfolio.onrender.com

--
This is an automated confirmation email from Menu Makers Portfolio.
                `,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Thank You for Contacting Us!</h1>
                            <p style="color: #d5f4e6; margin: 5px 0 0 0; font-size: 14px;">Your inquiry has been received</p>
                        </div>
                        <div style="padding: 25px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="font-size: 16px; color: #2c3e50; margin-top: 0;">Hi <strong>${name}</strong>,</p>
                            <p style="font-size: 14px; color: #2c3e50; line-height: 1.6;">Thank you for reaching out to Menu Makers! We have received your inquiry and assigned it reference number <strong style="color: #27ae60;">#${inquiryId}</strong>.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3498db; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px;">📋 Your Inquiry Details</h3>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr><td style="padding: 5px 0; font-weight: 600; color: #34495e;">Reference:</td><td style="padding: 5px 0; color: #27ae60; font-weight: 600;">#${inquiryId}</td></tr>
                                    <tr><td style="padding: 5px 0; font-weight: 600; color: #34495e;">Subject:</td><td style="padding: 5px 0; color: #2c3e50;">${subject || 'General Inquiry'}</td></tr>
                                    <tr><td style="padding: 5px 0; font-weight: 600; color: #34495e;">Requested Team:</td><td style="padding: 5px 0; color: #2c3e50;">${selectedTeamMember}</td></tr>
                                    <tr><td style="padding: 5px 0; font-weight: 600; color: #34495e;">Handled by:</td><td style="padding: 5px 0; color: #2c3e50;">Menu Makers Team</td></tr>
                                </table>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
                                    <p style="margin: 0; font-style: italic; color: #34495e; background: #f8f9fa; padding: 12px; border-radius: 4px; font-size: 13px;">"${message}"</p>
                                </div>
                            </div>
                            
                            <div style="background: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #f39c12; margin: 20px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #e67e22; font-size: 16px;">⏰ What Happens Next?</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #2c3e50; font-size: 14px; line-height: 1.6;">
                                    <li style="margin-bottom: 8px;">We will review your inquiry within 24-48 hours</li>
                                    <li style="margin-bottom: 8px;">Our team will prepare a detailed response</li>
                                    <li style="margin-bottom: 0;">You will receive a follow-up email with next steps</li>
                                </ul>
                            </div>
                            
                            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #27ae60; font-weight: 600;">📝 Please save your reference number</p>
                                <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c3e50; font-weight: 700; letter-spacing: 1px;">#${inquiryId}</p>
                                <p style="margin: 5px 0 0 0; font-size: 12px; color: #7f8c8d;">for future correspondence</p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #ecf0f1;">
                                <p style="margin: 0; font-size: 14px; color: #2c3e50;">Best regards,</p>
                                <p style="margin: 5px 0; font-size: 16px; color: #2c3e50; font-weight: 600;">The Menu Makers Team</p>
                                <p style="margin: 10px 0 0 0; font-size: 12px;">
                                    <a href="mailto:menumakers17@gmail.com" style="color: #3498db; text-decoration: none; margin-right: 15px;">📧 menumakers17@gmail.com</a>
                                    <a href="https://menu-makers-portfolio.onrender.com" style="color: #3498db; text-decoration: none;">🌐 Our Website</a>
                                </p>
                            </div>
                            
                            <div style="background: #ecf0f1; padding: 15px; border-radius: 6px; text-align: center; margin-top: 20px;">
                                <p style="margin: 0; font-size: 11px; color: #7f8c8d;">This is an automated confirmation email from Menu Makers Portfolio.</p>
                            </div>
                        </div>
                    </div>
                `,
                messageId: `confirmation-${inquiryId}-${Date.now()}@menumakers.com`,
                priority: 'normal'
            };

            // Send emails using universal function
            await sendEmail(teamMailOptions);
            await sendEmail(userMailOptions);

            // Log interaction in database
            const stmt = db.prepare(`
                INSERT INTO client_interactions 
                (inquiry_id, interaction_type, description, follow_up_required)
                VALUES (?, ?, ?, ?)
            `);
            
            stmt.run([
                inquiryId,
                'email_sent',
                `Initial contact email sent to Menu Makers Team (requested: ${selectedTeamMember})`,
                1
            ], (err) => {
                if (err) {
                    console.error('❌ Error logging interaction:', err.message);
                } else {
                    console.log(`✅ Interaction logged for inquiry #${inquiryId}`);
                }
            });
            
            stmt.finalize();

            console.log(`📧 Contact form submission #${inquiryId} processed successfully`);

            res.json({
                success: true,
                message: `Thank you for your message! We've assigned reference #${inquiryId} to your inquiry and will get back to you soon.`,
                referenceId: inquiryId
            });

        } catch (error) {
            console.error('❌ Contact form error:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error details:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                syscall: error.syscall,
                hostname: error.hostname,
                port: error.port
            });
            
            // Log environment variables status (without exposing values)
            console.error('🔍 Environment check:', {
                EMAIL_USER: !!process.env.EMAIL_USER,
                EMAIL_PASS: !!process.env.EMAIL_PASS,
                NODE_ENV: process.env.NODE_ENV,
                EMAIL_USER_LENGTH: process.env.EMAIL_USER ? process.env.EMAIL_USER.length : 0,
                EMAIL_PASS_LENGTH: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
            });
            
            res.status(500).json({
                success: false,
                message: 'Sorry, there was an error processing your request. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
    
    // Admin page route (protected)
    app.get('/admin', (req, res) => {
        // Set no-cache headers to prevent caching issues
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString()
        });
        
        if (req.session && req.session.adminLoggedIn) {
            res.sendFile(path.join(__dirname, 'public', 'admin.html'));
        } else {
            res.redirect('/login?expired=1');
        }
    });

    // Admin.html direct access (also protected)
    app.get('/admin.html', (req, res) => {
        // Set no-cache headers to prevent caching issues
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString()
        });
        
        // Temporarily bypass authentication for debugging
        console.log('🔍 Admin.html accessed - bypassing auth for debug');
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    });

    // Login page route
    app.get('/login', (req, res) => {
        // Set no-cache headers for login page too
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        if (req.session && req.session.adminLoggedIn) {
            res.redirect('/admin');
        } else {
            res.sendFile(path.join(__dirname, 'public', 'login.html'));
        }
    });

    // Admin endpoint to view inquiries (protected)
    app.get('/api/admin/inquiries', requireAuth, (req, res) => {
        db.all(`
            SELECT 
                id,
                name,
                email,
                subject,
                message,
                team_member,
                inquiry_type,
                status,
                created_at,
                responded_at
            FROM client_inquiries 
            ORDER BY created_at DESC 
            LIMIT 50
        `, [], (err, rows) => {
            if (err) {
                console.error('❌ Database query error:', err.message);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.json({ 
                success: true,
                inquiries: rows,
                total: rows.length 
            });
        });
    });

    // Statistics endpoint (protected)
    app.get('/api/admin/stats', requireAuth, (req, res) => {
        const stats = {};
        
        // Get total inquiries
        db.get('SELECT COUNT(*) as total FROM client_inquiries', [], (err, row) => {
            if (err) {
                console.error('❌ Database stats error:', err.message);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            stats.totalInquiries = row.total;
            
            // Get pending inquiries
            db.get('SELECT COUNT(*) as pending FROM client_inquiries WHERE status = "new"', [], (err, row) => {
                if (err) {
                    console.error('❌ Database stats error:', err.message);
                    res.status(500).json({ error: 'Database error' });
                    return;
                }
                stats.pendingInquiries = row.pending;
                
                // Get team member distribution
                db.all('SELECT team_member, COUNT(*) as count FROM client_inquiries GROUP BY team_member', [], (err, rows) => {
                    if (err) {
                        console.error('❌ Database stats error:', err.message);
                        res.status(500).json({ error: 'Database error' });
                        return;
                    }
                    stats.teamDistribution = rows;
                    
                    // Get recent inquiries (last 7 days)
                    db.get("SELECT COUNT(*) as recent FROM client_inquiries WHERE created_at > datetime('now', '-7 days')", [], (err, row) => {
                        if (err) {
                            console.error('❌ Database stats error:', err.message);
                            res.status(500).json({ error: 'Database error' });
                            return;
                        }
                        stats.recentInquiries = row.recent;
                        
                        res.json({
                            success: true,
                            stats: stats
                        });
                    });
                });
            });
        });
    });

    // Update inquiry status endpoint (protected)
    app.put('/api/admin/inquiries/:id/status', requireAuth, (req, res) => {
        const inquiryId = req.params.id;
        const { status } = req.body;

        if (!['new', 'responded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "new" or "responded"'
            });
        }

        const updateQuery = `
            UPDATE client_inquiries 
            SET status = ?, responded_at = CASE WHEN ? = 'responded' THEN CURRENT_TIMESTAMP ELSE responded_at END
            WHERE id = ?
        `;

        db.run(updateQuery, [status, status, inquiryId], function(err) {
            if (err) {
                console.error('Error updating inquiry status:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update inquiry status'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Inquiry not found'
                });
            }

            // Log the interaction
            const interactionStmt = db.prepare(`
                INSERT INTO client_interactions 
                (inquiry_id, interaction_type, description)
                VALUES (?, ?, ?)
            `);
            
            interactionStmt.run([
                inquiryId,
                'status_update',
                `Status updated to: ${status}`
            ]);
            
            interactionStmt.finalize();

            console.log(`📧 Inquiry #${inquiryId} marked as ${status}`);

            res.json({
                success: true,
                message: `Inquiry #${inquiryId} marked as ${status}`
            });
        });
    });

    // Send email from admin panel endpoint (protected)
    app.post('/api/admin/send-email', requireAuth, async (req, res) => {
        try {
            const { to, subject, message, inquiryId, replyTo } = req.body;

            // Validate required fields
            if (!to || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'To, subject, and message are required fields.'
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(to)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid recipient email address.'
                });
            }

            // Prepare anti-spam email options
            const mailOptions = {
                from: {
                    name: 'Menu Makers Support',
                    address: getEnvVar('EMAIL_USER') || 'menumakers17@gmail.com'
                },
                to: to,
                subject: inquiryId ? `Re: Business Inquiry #${inquiryId} - ${subject}` : `Menu Makers - ${subject}`,
                replyTo: replyTo || getEnvVar('EMAIL_USER'),
                text: message.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Message from Menu Makers</h1>
                            ${inquiryId ? `<p style="color: #ecf0f1; margin: 5px 0 0 0; font-size: 13px;">Re: Business Inquiry #${inquiryId}</p>` : ''}
                        </div>
                        <div style="padding: 25px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3498db;">
                                <div style="color: #2c3e50; line-height: 1.6; font-size: 14px;">
                                    ${message.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                            
                            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; margin-top: 20px;">
                                <h4 style="margin: 0 0 10px 0; color: #27ae60; font-size: 14px;">📧 Contact Information</h4>
                                <p style="margin: 0; color: #2c3e50; font-size: 13px;">
                                    <strong>From:</strong> Menu Makers Support Team<br>
                                    <strong>� Sent:</strong> ${new Date().toLocaleString()}<br>
                                    ${inquiryId ? `<strong>🔢 Reference:</strong> #${inquiryId}<br>` : ''}
                                    <strong>📞 Contact:</strong> <a href="mailto:menumakers17@gmail.com" style="color: #3498db; text-decoration: none;">menumakers17@gmail.com</a>
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #ecf0f1; margin-top: 20px;">
                                <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Menu Makers - Professional Web Development Services</p>
                                <p style="margin: 5px 0 0 0; font-size: 11px; color: #95a5a6;">This email was sent from Menu Makers Admin Panel</p>
                            </div>
                        </div>
                    </div>
                `,
                messageId: inquiryId ? `admin-reply-${inquiryId}-${Date.now()}@menumakers.com` : `admin-${Date.now()}@menumakers.com`,
                priority: 'normal'
            };

            // Send the email using universal function
            await sendEmail(mailOptions);
            console.log(`📧 Email sent from admin panel to: ${to}`);

            // Log interaction in database if this is a reply to an inquiry
            if (inquiryId) {
                const stmt = db.prepare(`
                    INSERT INTO client_interactions 
                    (inquiry_id, interaction_type, description, follow_up_required)
                    VALUES (?, ?, ?, ?)
                `);
                
                stmt.run([
                    inquiryId,
                    'admin_reply',
                    `Email sent from admin panel to ${to}. Subject: ${subject}`,
                    0
                ], (err) => {
                    if (err) {
                        console.error('❌ Error logging admin email interaction:', err.message);
                    } else {
                        console.log(`✅ Admin email interaction logged for inquiry #${inquiryId}`);
                    }
                });
                
                stmt.finalize();

                // Also update inquiry status to responded
                db.run(`
                    UPDATE client_inquiries 
                    SET status = 'responded', responded_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [inquiryId], (err) => {
                    if (err) {
                        console.error('❌ Error updating inquiry status:', err.message);
                    } else {
                        console.log(`✅ Inquiry #${inquiryId} marked as responded`);
                    }
                });
            }

            res.json({
                success: true,
                message: 'Email sent successfully!',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Admin email sending error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.'
            });
        }
    });

    // Test endpoint to create a sample inquiry (for testing)
    app.post('/api/test/create-inquiry', (req, res) => {
        console.log('📝 Creating test inquiry...');
        const sampleInquiry = {
            name: 'Test Client',
            email: 'test@example.com',
            phone: '555-0123',
            subject: 'Test Inquiry',
            message: 'This is a test inquiry to check the admin panel functionality.',
            team_member: 'company',
            inquiry_type: 'general',
            ip_address: '127.0.0.1',
            user_agent: 'Test Browser'
        };

        const insertInquiry = `
            INSERT INTO client_inquiries 
            (name, email, phone, subject, message, team_member, inquiry_type, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertInquiry, [
            sampleInquiry.name,
            sampleInquiry.email,
            sampleInquiry.phone,
            sampleInquiry.subject,
            sampleInquiry.message,
            sampleInquiry.team_member,
            sampleInquiry.inquiry_type,
            sampleInquiry.ip_address,
            sampleInquiry.user_agent
        ], function(err) {
            if (err) {
                console.error('❌ Error creating test inquiry:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create test inquiry',
                    error: err.message
                });
            }

            console.log(`✅ Test inquiry created with ID: ${this.lastID}`);

            res.json({
                success: true,
                message: `Test inquiry created with ID: ${this.lastID}`,
                inquiryId: this.lastID
            });
        });
    });

    // Create multiple test inquiries
    app.post('/api/test/create-sample-data', (req, res) => {
        console.log('📝 Creating sample data...');
        
        const sampleInquiries = [
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '555-0001',
                subject: 'Website Development Inquiry',
                message: 'Hi, I\'m interested in getting a new website for my restaurant. Can you help me with modern design and online ordering system?',
                team_member: 'jatinder',
                inquiry_type: 'team_specific'
            },
            {
                name: 'Bob Smith',
                email: 'bob@example.com',
                phone: '555-0002',
                subject: 'Mobile App Development',
                message: 'Looking for a mobile app for my food delivery business. Need iOS and Android versions.',
                team_member: 'mansi',
                inquiry_type: 'team_specific'
            },
            {
                name: 'Carol Davis',
                email: 'carol@example.com',
                phone: '555-0003',
                subject: 'E-commerce Platform',
                message: 'Need help setting up an online store for my bakery. Want to sell cakes and pastries online.',
                team_member: 'madhusudan',
                inquiry_type: 'team_specific'
            },
            {
                name: 'David Wilson',
                email: 'david@example.com',
                phone: '555-0004',
                subject: 'Digital Marketing Help',
                message: 'Need assistance with social media marketing and SEO for my restaurant.',
                team_member: 'ramesh',
                inquiry_type: 'team_specific'
            },
            {
                name: 'Eva Brown',
                email: 'eva@example.com',
                phone: '555-0005',
                subject: 'General Inquiry',
                message: 'What services do you offer for food businesses? I have a food truck and want to expand online.',
                team_member: 'company',
                inquiry_type: 'general'
            }
        ];

        let completed = 0;
        const total = sampleInquiries.length;
        const results = [];

        sampleInquiries.forEach((inquiry, index) => {
            const insertInquiry = `
                INSERT INTO client_inquiries 
                (name, email, phone, subject, message, team_member, inquiry_type, ip_address, user_agent, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(insertInquiry, [
                inquiry.name,
                inquiry.email,
                inquiry.phone,
                inquiry.subject,
                inquiry.message,
                inquiry.team_member,
                inquiry.inquiry_type,
                '127.0.0.1',
                'Sample Data Generator',
                index % 2 === 0 ? 'new' : 'responded'  // Mix of new and responded
            ], function(err) {
                completed++;
                
                if (err) {
                    console.error(`❌ Error creating sample inquiry ${index + 1}:`, err);
                    results.push({ error: err.message });
                } else {
                    console.log(`✅ Sample inquiry created with ID: ${this.lastID}`);
                    results.push({ success: true, id: this.lastID });
                }

                if (completed === total) {
                    res.json({
                        success: true,
                        message: `Created ${total} sample inquiries`,
                        results: results
                    });
                }
            });
        });
    });

    // Test route for debugging
    app.get('/test', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>Test Page</title>
                    <style>body { font-family: Arial; padding: 20px; }</style>
                </head>
                <body>
                    <h1>🧪 Server Test Page</h1>
                    <p>✅ Server is running properly</p>
                    <p>✅ Static file serving should work</p>
                    <p>✅ HTML rendering works</p>
                    <a href="/admin.html">→ Go to Admin Panel</a><br>
                    <a href="/login">→ Go to Login</a><br>
                    <a href="/">→ Go to Main Site</a><br>
                    <a href="/debug-admin.html">→ Go to Debug Admin Panel</a><br>
                    <a href="/simple-admin">→ Go to Simple Admin Test</a>
                </body>
            </html>
        `);
    });

    // Simple admin test without authentication
    app.get('/simple-admin', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>Simple Admin Test</title>
                    <style>
                        body { font-family: Arial; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                        .card { background: rgba(255,255,255,0.1); padding: 20px; margin: 10px; border-radius: 10px; }
                    </style>
                </head>
                <body>
                    <h1>🎛️ Simple Admin Test Page</h1>
                    <div class="card">
                        <h3>✅ CSS Styling Works</h3>
                        <p>This page shows that basic HTML, CSS and styling works properly.</p>
                    </div>
                    <div class="card">
                        <h3>🔍 Debug Information</h3>
                        <p>Server Time: ${new Date().toLocaleString()}</p>
                        <p>Session Info: ${req.session ? 'Session exists' : 'No session'}</p>
                        <p>Admin Logged In: ${req.session && req.session.adminLoggedIn ? 'Yes' : 'No'}</p>
                    </div>
                    <div class="card">
                        <h3>🧪 Test Links</h3>
                        <a href="/test" style="color: #90EE90;">← Back to Test Page</a><br>
                        <a href="/admin.html" style="color: #90EE90;">→ Try Admin Panel</a><br>
                        <a href="/admin-new.html" style="color: #90EE90;">→ Try NEW Admin Panel</a><br>
                        <a href="/login" style="color: #90EE90;">→ Go to Login</a>
                    </div>
                </body>
            </html>
        `);
    });

    // New Admin Panel (no auth required for testing)
    app.get('/admin-new', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'admin-new.html'));
    });

    // Admin-new.html direct access
    app.get('/admin-new.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'admin-new.html'));
    });
    
    // Debug endpoint to check database contents
    app.get('/api/debug/inquiries', (req, res) => {
        db.all(`SELECT * FROM client_inquiries ORDER BY created_at DESC LIMIT 10`, [], (err, rows) => {
            if (err) {
                console.error('❌ Database debug error:', err.message);
                res.status(500).json({ error: 'Database error', details: err.message });
                return;
            }
            res.json({ 
                success: true,
                inquiries: rows,
                total: rows.length,
                message: 'Debug data - these are the inquiries in the database'
            });
        });
    });

    // Clean database endpoint (for development only)
    app.post('/api/debug/clean-database', (req, res) => {
        console.log('🧹 Cleaning database...');
        
        // Delete all inquiries and interactions
        db.serialize(() => {
            db.run('DELETE FROM client_interactions', (err) => {
                if (err) {
                    console.error('❌ Error cleaning interactions:', err.message);
                } else {
                    console.log('✅ Client interactions cleaned');
                }
            });
            
            db.run('DELETE FROM client_inquiries', (err) => {
                if (err) {
                    console.error('❌ Error cleaning inquiries:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to clean database',
                        error: err.message
                    });
                } else {
                    console.log('✅ Client inquiries cleaned');
                    res.json({
                        success: true,
                        message: 'Database cleaned successfully'
                    });
                }
            });
        });
    });

    // Main page route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // 404 handler for unknown routes
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: 'Page not found',
            requested_url: req.originalUrl
        });
    });

    // Error handling middleware
    app.use((error, req, res, next) => {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📧 Admin panel: http://localhost:${PORT}/admin.html`);
    });

} catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
}
