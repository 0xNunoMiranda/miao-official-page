import mysql from 'mysql2/promise';

const dbConfig = {
  host: '62.193.192.12',
  user: 'miaotoke_mirandamon',
  password: '_Miranda69_!',
  database: 'miaotoke_miao',
  port: 3306
};

async function checkWallet() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT username, wallet_address FROM miao_admins WHERE username = "admin"');
    console.log('Current admin wallet:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkWallet();
