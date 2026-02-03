const { User } = require('./models');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetDeliveryPassword() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const email = 'delivery@meato.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [updated] = await User.update({ password: hashedPassword }, {
            where: { email, role: 'delivery_person' }
        });

        if (updated) {
            console.log(`Password for delivery user ${email} reset to '${newPassword}' successfully.`);
        } else {
            console.log(`Delivery user ${email} not found!`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
}

resetDeliveryPassword();
