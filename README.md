<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  
- Node.js (>=18.0.0)
- MySQL/MariaDB database
- npm (>=9.0.0)

### Setup Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=miao_tools

   # JWT Secret (change in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Solana RPC URL (optional, defaults to mainnet)
   SOLANA_RPC_URL=https://api.mainnet.solana.com

   # OpenAI API Key (for image generation)
   OPENAI_API_KEY=your_openai_api_key_here

   # Port (optional, default: 3000)
   PORT=3000

   # Node Environment
   NODE_ENV=development
   ```

3. **Setup Database:**
   
   Execute the SQL scripts in the `database/` folder:
   - `complete-setup.sql` - Complete database setup (tables + stored procedures)
   - Or `mariadb-procedures.sql` - Only stored procedures (if tables already exist)

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   This will start the Next.js development server on `http://localhost:3000`

5. **Or run as production server (custom HTTP server):**
   ```bash
   npm run start
   ```
   
   This uses the custom `app.js` server (useful for production-like testing)

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. **Important:** Add the following environment variables in Vercel project settings:
   - `OPENAI_API_KEY` - Your OpenAI API key (required for `/api/generate-image` endpoint)
4. Deploy!

**Note:** If you get a 404 error after deployment, make sure:
- All environment variables are set in Vercel
- The build completes successfully (check build logs)
- You're accessing the correct domain
