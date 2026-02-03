const { User } = require('./models');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const email = 'admin@meato.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [updated] = await User.update({ password: hashedPassword }, {
            where: { email }
        });

        if (updated) {
            console.log(`Password for ${email} reset to '${newPassword}' successfully.`);
        } else {
            console.log(`User ${email} not found!`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
}

resetPassword();
