const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_super_secret_key_that_is_long_and_random";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required.' });
    }
};

const isOrganizer = (req, res, next) => {
    if (req.user && req.user.role === 'organizer') {
        next();
    } else {
        res.status(403).json({ error: 'Organizer access required.' });
    }
}

// NEW: Middleware to check for Staff or Admin role
const isStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Staff or Admin access required.' });
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    isOrganizer,
    isStaff // Export the new middleware
};