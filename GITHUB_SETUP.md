# GitHub Repository Setup Guide

Follow these steps to set up your GitHub repository and add your instructor as a collaborator.

## Step 1: Initialize Git Repository (if not already done)

Open your terminal and navigate to the capstone1 directory:

```bash
cd /Users/hadicharamand/CIT382/capstone/capstone1
```

Initialize git (if not already initialized):

```bash
git init
```

## Step 2: Add All Files

Add all your project files:

```bash
git add .
```

Check what will be committed:

```bash
git status
```

## Step 3: Make Your First Commit

```bash
git commit -m "Initial commit: BudgetBuddy+ with React components"
```

## Step 4: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Repository name: `budgetbuddy-plus` (or your preferred name)
5. Description: "BudgetBuddy+ - Personal Finance Tracker with React"
6. Choose **Public** or **Private** (check with your instructor)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **Create repository**

## Step 5: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/hadichar/budget_buddy.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Step 6: Add Instructor as Collaborator

1. Go to your repository on GitHub
2. Click on **Settings** (top menu bar)
3. Click on **Collaborators** in the left sidebar
4. Click **Add people** button
5. Type: `pcolbert-uo`
6. Select the user from the dropdown
7. Click **Add pcolbert-uo to this repository**
8. The instructor will receive an email invitation

## Step 7: Verify Everything Works

1. Refresh your repository page on GitHub
2. You should see all your files
3. Under **Settings > Collaborators**, you should see `pcolbert-uo` listed

## Your Repository Link

Your repository link will be:
```
https://github.com/YOUR_USERNAME/budgetbuddy-plus
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/budgetbuddy-plus.git
```

### If you need to update your repository later:
```bash
git add .
git commit -m "Your commit message"
git push
```

### If you can't find the Collaborators section:
- Make sure you're the repository owner
- Check that you're in the Settings page (not the repository main page)

## Files Included in Repository

Your repository should include:
- ✅ `server/` - Backend Express server
- ✅ `client/` - React frontend
- ✅ `database/` - SQL schema and seed files
- ✅ `documentation/` - README and demo files
- ✅ `.gitignore` - Excludes node_modules and other unnecessary files

## Important Notes

- **Never commit sensitive data** like passwords or API keys
- The `.gitignore` file will prevent `node_modules/` from being uploaded
- Make sure your `.env` file is in `.gitignore` (it should be)
- Always test your code before pushing to GitHub
