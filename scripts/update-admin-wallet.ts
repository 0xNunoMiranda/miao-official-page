import { execute } from '../lib/db';

async function updateAdminWallet() {
  const newWallet = 'HGeMNm4JiuVhpybu5M63KRVWCw4G4Fcwe5RQjky4pXrt';
  const username = 'admin';

  console.log(`Updating admin wallet for user '${username}' to '${newWallet}'...`);

  try {
    // Update the wallet address for the admin user
    // Assuming the table is miao_admins and columns are username and wallet_address
    const query = `
      UPDATE miao_admins 
      SET wallet_address = ? 
      WHERE username = ?
    `;
    
    const result = await execute(query, [newWallet, username]);
    console.log('Update result:', result);
    console.log('🎉 Admin wallet updated successfully!');
  } catch (error) {
    console.error('❌ Error updating admin wallet:', error);
  }
}

updateAdminWallet();
