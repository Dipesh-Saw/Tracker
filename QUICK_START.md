# ⚡ Quick Start Guide

Get your Document Tracker up and running in 5 minutes!

## 🚀 Installation in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/docTracker
SESSION_SECRET=my_secret_key_12345
PORT=3000
```

### Step 3: Start the Server

```bash
npm start
```

✅ **Done!** Open `http://localhost:3000`

---

## 👤 First Time Setup

### 1. Register Your First User

- Navigate to: `http://localhost:3000/auth/register`
- Fill in:
  - Username: `admin`
  - Email: `admin@example.com`
  - Password: `YourSecurePassword123`
- Click "Register"

### 2. Make User an Admin

Connect to MongoDB and run:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { isAdmin: true } });
```

Or using MongoDB Compass:

1. Open `docTracker` database
2. Open `users` collection
3. Find your user
4. Edit and add: `isAdmin: true`

### 3. Login and Start Tracking!

- Go to: `http://localhost:3000/auth/login`
- Login with your credentials
- Start creating entries!

---

## 🎯 Basic Usage

### Create Your First Entry

1. **Select Date**: Choose today's date
2. **Select Shift**: Half Day, Full Day, or PTO
3. **Add Entry**:
   - Platform: PEGA or WISE
   - Queue: Queue1, Queue2, or Queue3
   - Document Type: Will populate based on queue
   - Count: Number of documents
   - Time: Time spent in minutes
4. **Add More Rows**: Click "+ Add Row" for multiple entries
5. **Submit**: Click "Submit Entry"

### View Your Dashboard

1. Click "Dashboard" button
2. See your charts:
   - Document types processed today
   - Platform distribution
   - Performance stats
   - Weekly trends
3. Use filters:
   - **Date Filter**: Change date for stats
   - **Queue Filter**: Filter weekly trends
   - **Queue Performance**: Select date + queue

### Export Your Data

1. Go to Dashboard
2. Click "Export to Excel" button
3. Download .xlsx file

---

## 🔧 Customization

### Add Your Own Platforms

Edit `models/MyObjects.js`:

```javascript
const platforms = ["Platform1", "Platform2", "Platform3"];
```

### Add Your Own Queues

```javascript
const Queue = ["QueueA", "QueueB", "QueueC"];
```

### Add Document Types

```javascript
const documentType = {
  QueueA: ["Type1", "Type2", "Type3"],
  QueueB: ["TypeX", "TypeY", "TypeZ"],
  QueueC: ["DocA", "DocB", "DocC"],
};
```

Restart server to see changes!

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"

- ✅ Check MongoDB is running
- ✅ Verify MONGO_URI in .env
- ✅ For cloud DB, check internet connection

### "Session not working"

- ✅ Add SESSION_SECRET to .env
- ✅ Clear browser cookies

### "Port 3000 already in use"

```bash
# Kill the process
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

---

## 📱 Quick Commands

```bash
# Start in development mode (auto-restart)
npm run dev

# Start in production mode
npm start

# Install new dependency
npm install package-name

# Update all packages
npm update
```

---

## 🎓 Learn More

- Full documentation: [README.md](./README.md)
- API endpoints: See server.js
- Customize UI: Edit `public/css/style.css`
- Modify charts: Edit `public/js/dashboard-chart.js`

---

## 💡 Pro Tips

1. **Use Cloud MongoDB** (MongoDB Atlas) for production
2. **Create multiple users** for team tracking
3. **Export data regularly** for backups
4. **Use admin account** to manage team entries
5. **Check dashboard daily** for performance insights

---

## 🎉 You're All Set!

Start tracking your productivity now!

Need help? Check the full [README.md](./README.md) for detailed documentation.
