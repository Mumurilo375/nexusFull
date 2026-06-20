import sequelize from './src/config/database';
import Users from './src/models/Users';

async function main() {
  try {
    await sequelize.authenticate();
    const user = await Users.findOne({ where: { email: 'Izaac@gmail.com' } });
    if (!user) {
      console.log('Usuário não encontrado');
      process.exit(1);
    }
    console.log('Usuário encontrado:', user.get('email'), 'isAdmin:', user.get('isAdmin'));
    await user.update({ isAdmin: true });
    console.log('Usuário atualizado para admin:', user.get('email'), 'isAdmin:', user.get('isAdmin'));
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

main();
