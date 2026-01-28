# HashChain.me

Track your daily goals as an immutable blockchain. Visualize your progress with a Mempool.space-inspired interface.

## 🚀 Deploying to GitHub Pages with Custom Domain

### Step 1: Push to GitHub

1. **Create a new repository** on GitHub (https://github.com/new)
   - Name it `hashchain-me` (or any name you prefer)
   - Make it **public** (required for free GitHub Pages)
   - Don't initialize with README (you already have one)

2. **Add GitHub as remote** and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/hashchain-me.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Click on **"create your own"** or **"configure"** for GitHub Pages

5. **Create workflow file** at `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         - run: npm install
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/deploy-pages@v4
           id: deployment
   ```

6. Commit and push this file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Pages deployment workflow"
   git push
   ```

### Step 3: Add Custom Domain (hashchainme.com)

1. **In your repository**: Settings → Pages → Custom domain
   - Enter: `hashchainme.com`
   - Click **Save**

2. **In your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.):
   - Add these DNS records:
   
   **A Records** (point to GitHub's IPs):
   ```
   Type: A
   Name: @
   Value: 185.199.108.153

   Type: A
   Name: @
   Value: 185.199.109.153

   Type: A
   Name: @
   Value: 185.199.110.153

   Type: A
   Name: @
   Value: 185.199.111.153
   ```

   **CNAME Record** (for www):
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```

3. **Wait for DNS propagation** (can take up to 48 hours, usually much faster)

4. **Enable HTTPS**: 
   - Back in GitHub Pages settings
   - Check **"Enforce HTTPS"** (after DNS propagates)

### Step 4: Verify Deployment

- Your site will be live at `https://hashchainme.com`
- GitHub provides free SSL certificate
- Automatic deployments on every push to main branch

## 🎯 Features

- **Multi-chain support**: Create separate blockchains for different goal sets
- **Future blocks**: See the next 7 days of upcoming blocks
- **Visual fill tracking**: Blocks fill from bottom to top based on completion
- **Search**: Find blocks by number or date
- **Analytics**: View progress trends over time periods
- **Auto-mining**: Blocks lock after 24 hours

## 🛠️ Local Development

```bash
npm install
npm run dev
```

## 📝 Building

```bash
npm run build
```

Output will be in the `dist/` directory.

---

**Vibed with [Shakespeare](https://shakespeare.diy)**
