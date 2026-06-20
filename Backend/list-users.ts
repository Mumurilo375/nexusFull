import sequelize from './src/config/database';
import Users from './src/models/Users';

async function main() {
  try {
    await sequelize.authenticate();
    const users = await Users.findAll({ limit: 20 });
    console.log('Usuários no banco:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.get('email')}, Username: ${user.get('username')}, isAdmin: ${user.get('isAdmin')}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

main();
