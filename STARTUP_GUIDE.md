# 🚀 Modus Startup Guide

Welcome to the **Modus** project! This guide is designed to help you get your mobile marketplace app up and running, even if you aren't a developer.

---

## 🛠 Step 1: Pre-requisites
Before you start, make sure you have these two things installed on your Mac:
1. **Node.js**: [Download here](https://nodejs.org/) (Choose the "LTS" version).
2. **Expo Go**: Download the "Expo Go" app from the App Store (iPhone) or Play Store (Android) on your phone.

---

## 🏗 Step 2: Initialize the Database (One-time)
We use **Supabase** for your database. Since you've already created the project, follow these steps:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on the **SQL Editor** (the `>_` icon on the left sidebar).
3. Click **New Query**.
4. Open the file [**supabase/schema.sql**](file:///Applications/Antigravitty/Modus/supabase/schema.sql) in this project.
5. Copy everything in that file and paste it into the Supabase SQL editor.
6. Click **Run**.
   * *This creates all your tables, roles (Admin, Brand, Influencer), and security rules.*

---

## 📦 Step 3: Install the App "Gears"
Now we need to tell your computer to download all the necessary tools for the app.
1. Open your Mac **Terminal** (Press `Cmd + Space` and type "Terminal").
2. Copy and paste this line and press Enter:
   ```bash
   cd /Applications/Antigravitty/Modus && npm install
   ```
   * *This might take a minute. It's downloading all the building blocks like navigation, icons, and styling.*

---

## 🔑 Step 4: Your Secret Keys
The app needs to "talk" to your Supabase database. I have already set this up for you in the [**.env**](file:///Applications/Antigravitty/Modus/.env) file. 
*   **Important:** Do not delete this file! It contains the "address" and "keys" to your database.

---

## 📱 Step 5: Launch the App!
Whenever you want to work on or see the app, do this:
1. Open your **Terminal**.
2. Run this command:
   ```bash
   cd /Applications/Antigravitty/Modus && npx expo start
   ```
3. A large **QR Code** will appear in your terminal.
4. Open the **Camera app** on your phone and point it at the QR Code.
5. Tap the link that appears—it will open the **Expo Go** app and load your project!

---

## 📂 What are these files? (The Simple Version)
*   **`App.tsx`**: The main entry point of the app.
*   **`src/navigation/`**: This is the "GPS" of the app. It decides which screen a user sees based on if they are an Admin, a Brand, or an Influencer.
*   **`src/screens/`**: This is where the actual pages (like the Admin Dashboard) live.
*   **`package.json`**: A list of all the "ingredients" the app needs to run.

---

**Need help?** Just ask me "How do I run the app?" or "What does this file do?" and I'll explain it!
