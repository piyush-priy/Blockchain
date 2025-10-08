const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const DBSOURCE = "./database.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error("FATAL: Could not connect to the database.", err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database successfully.');
        
        db.serialize(() => {
            console.log('Setting up database tables...');

            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                walletAddress TEXT
            )`, (err) => {
                if (err) console.error("Error creating users table:", err.message);
                else {
                    console.log("Users table is ready.");
                    addAdminUser(); // Add admin user after table is confirmed
                }
            });

            // Events Table - Initial creation with basic fields for migration compatibility
            db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                venue TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                maxResaleCount INTEGER DEFAULT 3,
                priceCap INTEGER DEFAULT 120
            )`, (err) => {
                if (err) {
                    console.error("Error creating events table:", err.message);
                } else {
                    console.log("Events table is ready.");
                    // MIGRATION: Safely add new columns if they don't exist
                    db.all("PRAGMA table_info(events)", (pragmaErr, columns) => {
                        if (pragmaErr) return console.error("Could not get table info for events", pragmaErr.message);

                        const columnExists = (name) => columns.some(col => col.name === name);
                        const columnsToAdd = [
                            { name: 'description', type: 'TEXT' },
                            { name: 'posterUrl', type: 'TEXT' },
                            { name: 'seatLayout', type: 'TEXT' },
                            { name: 'type', type: 'TEXT' }
                        ];

                        let migrationsPending = columnsToAdd.filter(c => !columnExists(c.name)).length;
                        if (migrationsPending === 0) {
                             seedInitialEvents(); // Seed if no migrations are needed
                             return;
                        }

                        columnsToAdd.forEach(column => {
                            if (!columnExists(column.name)) {
                                console.log(`Migrating events table: adding ${column.name} column...`);
                                db.run(`ALTER TABLE events ADD COLUMN ${column.name} ${column.type}`, (alterErr) => {
                                    if (alterErr) console.error(`Error adding ${column.name} column:`, alterErr.message);
                                    else console.log(`Column ${column.name} added.`);
                                    
                                    migrationsPending--;
                                    if(migrationsPending === 0) {
                                        console.log("All event table migrations completed.");
                                        seedInitialEvents(); // Seed events only after all migrations are done
                                    }
                                });
                            }
                        });
                    });
                }
            });

            // Tickets Table
            db.run(`CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tokenId INTEGER UNIQUE NOT NULL,
                eventId INTEGER NOT NULL,
                metadataUri TEXT,
                ownerWallet TEXT,
                status TEXT DEFAULT 'valid',
                FOREIGN KEY (eventId) REFERENCES events (id)
            )`, (err) => {
                if (err) {
                     console.error("Error creating tickets table:", err.message);
                } else {
                    console.log("Tickets table is ready.");
                    // MIGRATION: Add the purchasePrice column if it doesn't exist
                    db.all("PRAGMA table_info(tickets)", (pragmaErr, columns) => {
                        if (pragmaErr) return console.error("Could not get table info for tickets", pragmaErr.message);
                        
                        if (!columns.some(col => col.name === 'purchasePrice')) {
                            console.log("Migrating tickets table: adding purchasePrice column...");
                            db.run("ALTER TABLE tickets ADD COLUMN purchasePrice INTEGER DEFAULT 0", (alterErr) => {
                                if (alterErr) console.error("Error adding purchasePrice column:", alterErr.message);
                                else console.log("Tickets table migrated successfully.");
                            });
                        }
                    });
                }
            });
        });
    }
});

const addAdminUser = () => {
    const adminEmail = 'admin@t.com';
    const adminPassword = 'pass1234';
    const adminRole = 'admin';
    const adminWallet = '0xe251780676c96F5B8c9217a8803a3571a55a6232';

    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], (err, row) => {
        if (err) {
            console.error("Error checking for admin user:", err.message);
            return;
        }
        if (!row) {
            console.log('Admin user not found, creating one...');
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(adminPassword, salt);

            db.run(`INSERT INTO users (email, password, role, walletAddress) VALUES (?, ?, ?, ?)`,
                [adminEmail, hashedPassword, adminRole, adminWallet],
                (insertErr) => {
                    if (insertErr) {
                        console.error("Error creating admin user:", insertErr.message);
                    } else {
                        console.log(`Successfully created admin user with email: ${adminEmail}`);
                    }
                }
            );
        }
    });
};

// CORRECTED: This function now seeds events with all the required fields.
const seedInitialEvents = () => {
    db.get(`SELECT COUNT(*) as count FROM events`, (err, row) => {
        if (err) {
            console.error("Error checking events for seeding:", err.message);
            return;
        }
        if (row.count === 0) {
            console.log('No events found, seeding initial data with full details...');
            const eventsToSeed = [
                { 
                    name: 'Stellar Sound Fest', 
                    date: '2025-11-15', 
                    venue: 'Galaxy Arena', 
                    status: 'Approved',
                    type: 'concert',
                    description: 'An unforgettable night with the galaxy\'s biggest stars. Experience music that is out of this world.',
                    posterUrl: 'https://placehold.co/400x600/2d3748/edf2f7?text=Stellar+Sound',
                    seatLayout: JSON.stringify({ rows: 10, seatsPerRow: 20, tiers: { 'VIP': 500, 'Standard': 200 } })
                },
                { 
                    name: 'Cyberpunk Cinema Premiere', 
                    date: '2025-12-01', 
                    venue: 'Chroma Theater', 
                    status: 'Approved',
                    type: 'movie',
                    description: 'Premiere of the most anticipated sci-fi blockbuster of the decade. Walk the neon-lit red carpet.',
                    posterUrl: 'https://placehold.co/400x600/718096/1a202c?text=Cyberpunk+Cinema',
                    seatLayout: JSON.stringify({ rows: 8, seatsPerRow: 15, tiers: { 'Premium': 150, 'Regular': 80 } })
                },
                { 
                    name: 'Gravity Games Championship', 
                    date: '2025-10-26', 
                    venue: 'Zero-G Stadium', 
                    status: 'Pending',
                    type: 'sports',
                    description: 'Witness the final showdown of the World Gravity Ball league. A must-see for all sports fans.',
                    posterUrl: 'https://placehold.co/400x600/4a5568/e2e8f0?text=Gravity+Games',
                    seatLayout: JSON.stringify({ rows: 25, seatsPerRow: 40, tiers: { 'Courtside': 1000, 'Lower Bowl': 400, 'Upper Bowl': 150 } })
                }
            ];

            const stmt = db.prepare(`INSERT INTO events (name, date, venue, status, type, description, posterUrl, seatLayout) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            for (const event of eventsToSeed) {
                stmt.run(event.name, event.date, event.venue, event.status, event.type, event.description, event.posterUrl, event.seatLayout);
            }
            stmt.finalize((err) => {
                if (err) console.error("Error seeding events:", err.message);
                else console.log("Successfully seeded initial events with full details.");
            });
        }
    });
};
addAdminUser();
module.exports = db;

