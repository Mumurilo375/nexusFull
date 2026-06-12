const sequelize = require('./src/config/database').default;

async function resetSequence() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Reset the categories sequence
    await sequelize.query(`SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories)+1);`);
    console.log('Categories sequence reset successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetSequence();
