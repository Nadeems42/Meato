// Script to reset database and apply new seed data
// Run with: node reset-database.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Resetting Database with New Seed Data...\n');

const dbPath = path.join(__dirname, 'database.sqlite');

// Step 1: Backup existing database (optional)
if (fs.existsSync(dbPath)) {
    const backupPath = path.join(__dirname, `database.backup.${Date.now()}.sqlite`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backed up existing database to: ${path.basename(backupPath)}`);

    // Delete existing database
    fs.unlinkSync(dbPath);
    console.log('✅ Deleted existing database\n');
}

// Step 2: Run the server to recreate tables
console.log('📦 Creating new database with updated schema...');
console.log('   (This will start the server briefly)\n');

try {
    // Start server which will create tables via sequelize sync
    const serverProcess = require('child_process').spawn('node', ['server.js'], {
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'development' }
    });

    let output = '';

    serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Server started on port')) {
            // Server is ready, kill it
            serverProcess.kill();
        }
    });

    serverProcess.on('close', (code) => {
        console.log('✅ Database schema created\n');

        // Step 3: Run seed script
        console.log('🌱 Seeding database with initial data...\n');

        try {
            execSync('node seed.js', { stdio: 'inherit', cwd: __dirname });
            console.log('\n✅ Database seeded successfully!\n');
            console.log('🎉 Database reset complete!\n');
            console.log('📝 New Super Admin Credentials:');
            console.log('   Email: vaagaimarket@gmail.com');
            console.log('   Password: password123');
            console.log('   Phone: +91 96007 13333\n');
        } catch (error) {
            console.error('❌ Error seeding database:', error.message);
            process.exit(1);
        }
    });

    // Safety timeout
    setTimeout(() => {
        if (!serverProcess.killed) {
            serverProcess.kill();
        }
    }, 10000);

} catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
}
