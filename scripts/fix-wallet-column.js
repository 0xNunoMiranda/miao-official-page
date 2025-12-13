import mysql from 'mysql2/promise';

console.log("Script started");

const dbConfig = {
  host: '62.193.192.12',
  user: 'miaotoke_mirandamon',
  password: '_Miranda69_!',
  database: 'miaotoke_miao',
  port: 3306
};

async function fixAndupdateAdminWallet() {
  const newWallet = 'HGeMNm4JiuVhpybu5M63KRVWCw4G4Fcwe5RQjky4pXrt';
  const username = 'admin';

  console.log(`Connecting to database...`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    console.log('Altering table to support longer wallet addresses...');
    await connection.execute('ALTER TABLE miao_admins MODIFY COLUMN wallet_address VARCHAR(100)');
    console.log('Table altered.');

    console.log(`Updating admin wallet for user '${username}' to '${newWallet}'...`);

    const [result] = await connection.execute(
      'UPDATE miao_admins SET wallet_address = ? WHERE username = ?',
      [newWallet, username]
    );

    console.log('Update result:', result);
    console.log('🎉 Admin wallet updated successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAndupdateAdminWallet();
