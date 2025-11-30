<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in `.env.local` to your OpenAI API key (required for image generation)
3. Run the app:
   `npm run dev`

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
