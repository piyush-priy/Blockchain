const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, isOrganizer, isAdmin, isStaff } = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = "your_super_secret_key_that_is_long_and_random";
const SALT_ROUNDS = 10;

// --- User Authentication ---
app.post('/register', async (req, res) => {
    const { email, password, role, walletAddress } = req.body;
    if (!email || !password || !role || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const sql = `INSERT INTO users (email, password, role, walletAddress) VALUES (?, ?, ?, ?)`;
        db.run(sql, [email, hashedPassword, role, walletAddress], function(err) {
            if (err) {
                console.error("Database registration error:", err.message); 
                res.status(500).json({ error: "Could not register user. Email may already be in use." });
                return;
            }
            res.status(201).json({ id: this.lastID, message: "User registered successfully." });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration." });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;

    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const tokenPayload = { id: user.id, email: user.email, role: user.role, wallet: user.walletAddress };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: tokenPayload });
    });
});

// --- Event Management ---
app.post('/events', authenticateToken, isOrganizer, (req, res) => {
    const { name, date, venue, maxResaleCount, priceCap, description, posterUrl, seatLayout, type } = req.body;
    
    if (!name || !date || !venue || !type || !description || !posterUrl) {
        return res.status(400).json({ error: "Missing required fields: name, date, venue, type, description, posterUrl." });
    }

    const seatLayoutJSON = typeof seatLayout === 'object' ? JSON.stringify(seatLayout) : seatLayout;
    const sql = `INSERT INTO events (name, date, venue, maxResaleCount, priceCap, description, posterUrl, seatLayout, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, date, venue, maxResaleCount || 3, priceCap || 120, description, posterUrl, seatLayoutJSON, type];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

app.get('/events', (req, res) => {
    const sql = `SELECT * FROM events`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const events = rows.map(event => {
            try {
                return {
                    ...event,
                    seatLayout: event.seatLayout ? JSON.parse(event.seatLayout) : {},
                    unavailableSeats: []
                };
            } catch (e) {
                console.error(`Failed to parse seatLayout for event ID ${event.id}:`, e);
                return {
                    ...event,
                    seatLayout: {},
                    unavailableSeats: []
                };
            }
        });
        res.json({ events: events });
    });
});

app.put('/events/:id', authenticateToken, isOrganizer, (req, res) => {
    const { name, date, venue, description, posterUrl, seatLayout, type, maxResaleCount, priceCap } = req.body;
    
    const seatLayoutJSON = typeof seatLayout === 'object' ? JSON.stringify(seatLayout) : seatLayout;
    const sql = `UPDATE events SET name = ?, date = ?, venue = ?, description = ?, posterUrl = ?, seatLayout = ?, type = ?, maxResaleCount = ?, priceCap = ? WHERE id = ?`;
    const params = [name, date, venue, description, posterUrl, seatLayoutJSON, type, maxResaleCount, priceCap, req.params.id];
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json({ message: "Event updated successfully.", changes: this.changes });
    });
});

app.delete('/events/:id', authenticateToken, isOrganizer, (req, res) => {
    const sql = `DELETE FROM events WHERE id = ?`;
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json({ message: "Event deleted successfully.", changes: this.changes });
    });
});

app.put('/events/:id/status', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Approved', 'Live', 'Completed', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const sql = `UPDATE events SET status = ? WHERE id = ?`;
    db.run(sql, [status, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: `Event status updated to ${status}.` });
    });
});

app.get('/events/:id/sales', authenticateToken, (req, res) => {
    const eventId = req.params.id;
    const sql = `SELECT COUNT(*) as ticketsMinted, SUM(purchasePrice) as primarySalesRevenue FROM tickets WHERE eventId = ?`;
    db.get(sql, [eventId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const response = {
            ticketsMinted: row.ticketsMinted || 0,
            primarySalesRevenue: row.primarySalesRevenue || 0
        };
        res.json(response);
    });
});

// --- Ticket & Metadata ---

// NEW: Endpoint to get all tickets owned by the authenticated user
app.get('/tickets/my-tickets', authenticateToken, (req, res) => {
    // The user's wallet address is on the JWT payload added by `authenticateToken`
    const userWalletAddress = req.user.wallet;

    if (!userWalletAddress) {
        return res.status(400).json({ error: "User wallet address not found in token." });
    }

    // Join tickets and events table to get all necessary data in one query
    const sql = `
        SELECT
            t.tokenId,
            t.ownerWallet,
            t.status as ticketStatus,
            e.id as eventId,
            e.name as eventName,
            e.date as eventDate,
            e.venue as eventVenue,
            e.posterUrl as eventPosterUrl,
            e.contractAddress
        FROM tickets t
        JOIN events e ON t.eventId = e.id
        WHERE t.ownerWallet = ?
    `;

    db.all(sql, [userWalletAddress.toLowerCase()], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed: " + err.message });
        }
        res.json(rows);
    });
});


app.post('/tickets', (req, res) => {
    const { tokenId, eventId, metadataUri, ownerWallet, purchasePrice } = req.body;
    if (!tokenId || !eventId || !metadataUri || !ownerWallet || purchasePrice === undefined) {
        return res.status(400).json({ error: "Missing required fields, including purchasePrice." });
    }

    const sql = `INSERT INTO tickets (tokenId, eventId, metadataUri, ownerWallet, purchasePrice) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [tokenId, eventId, metadataUri, ownerWallet.toLowerCase(), purchasePrice], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.get('/metadata/:tokenId/:contractAddress', (req, res) => {
    const { tokenId, contractAddress } = req.params;
    const sql = `
        SELECT t.tokenId, e.name as eventName, e.date, e.venue 
        FROM tickets t
        JOIN events e ON t.eventId = e.id
        WHERE t.tokenId = ? AND e.contractAddress = ?
    `;

    db.get(sql, [tokenId, contractAddress], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            return res.status(404).json({ error: 'Ticket not found for this event contract.' });
        }
        
        res.json({
            name: `Ticket for ${row.eventName} - #${row.tokenId}`,
            description: `This NFT is a ticket for ${row.eventName} at ${row.venue} on ${row.date}.`,
            image: "https://via.placeholder.com/500/FF0000/FFFFFF?text=EVENT+TICKET",
            attributes: [
                { "trait_type": "Event", "value": row.eventName },
                { "trait_type": "Date", "value": row.date },
                { "trait_type": "Venue", "value": row.venue }
            ]
        });
    });
});

// --- Ticket Verification ---
app.post('/tickets/:tokenId/mark-used', authenticateToken, isStaff, (req, res) => {
    const { tokenId } = req.params;
    const checkSql = `SELECT status FROM tickets WHERE tokenId = ?`;
    db.get(checkSql, [tokenId], (err, ticket) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }
        if (ticket.status === 'used') {
            return res.status(409).json({ error: 'This ticket has already been used.' });
        }

        const updateSql = `UPDATE tickets SET status = 'used' WHERE tokenId = ?`;
        db.run(updateSql, [tokenId], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, message: `Ticket ${tokenId} marked as used.` });
        });
    });
});

// NEW Endpoint for resale prevention check
app.get('/tickets/:tokenId/:contractAddress/status', authenticateToken, (req, res) => {
    const { tokenId, contractAddress } = req.params;
    const sql = `
        SELECT t.status FROM tickets t
        JOIN events e ON t.eventId = e.id
        WHERE t.tokenId = ? AND e.contractAddress = ?
    `;
    db.get(sql, [tokenId, contractAddress.toLowerCase()], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed: " + err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Ticket not found for the specified contract." });
        }
        res.json({ status: row.status });
    });
});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

