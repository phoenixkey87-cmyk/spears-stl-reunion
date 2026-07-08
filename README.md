# Spears STL Family Reunion 2026 🎉

Welcome to the **Spears STL Family Reunion** website! This is a fully functional event site built for the September 5, 2026 reunion at Tilles Park, St. Louis, MO.

---

## 📋 Features

- **Landing Page** – Beautiful hero section, event details, countdown timer, and activity showcase
- **RSVP Form** – Collects guest info (name, email, phone, t-shirt size) for each attendee
  - Integrated with **Formspree** to receive submissions via email
  - Saves submissions to browser LocalStorage for the tracker page
- **Admin Tracker** – View all RSVPs with stats, filters, search, and CSV export
  - T-shirt size summary
  - Branch breakdown chart
  - Edit/delete entries

---

## 🚀 How to Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click **New repository**
3. Name it: `spears-stl-reunion` (or anything you prefer)
4. Make it **Public**
5. **Do NOT** initialize with README (we already have one)
6. Click **Create repository**

### Step 2: Push Your Code

Open your terminal in the `spears-stl` folder and run:

```bash
git init
git add .
git commit -m "Initial commit - Spears STL Reunion website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/spears-stl-reunion.git
git push -u origin main
```

*(Replace `YOUR-USERNAME` with your actual GitHub username)*

### Step 3: Enable GitHub Pages

1. In your GitHub repo, go to **Settings** → **Pages**
2. Under **Source**, select `main` branch and `/ (root)` folder
3. Click **Save**
4. Your site will be live at:  
   `https://YOUR-USERNAME.github.io/spears-stl-reunion/`

---

## 📧 Formspree Configuration

The RSVP form is already connected to:

```
https://formspree.io/f/mjgqdrjv
```

When someone submits the form:
- **Formspree** emails you the submission
- **LocalStorage** saves it so the tracker page can display it

If you need to change the Formspree endpoint, edit line 6 in `js/rsvp.js`:

```javascript
const FORMSPREE = 'https://formspree.io/f/YOUR-NEW-ENDPOINT';
```

---

## 🛠️ Project Structure

```
spears-stl/
├── index.html          # Landing page
├── rsvp.html           # RSVP form
├── admin.html          # Guest tracker (admin)
├── css/
│   ├── style.css       # Global styles
│   ├── home.css        # Landing page styles
│   ├── rsvp.css        # RSVP form styles
│   └── admin.css       # Admin tracker styles
├── js/
│   ├── countdown.js    # Countdown timer for landing page
│   ├── rsvp.js         # RSVP form logic + Formspree submit
│   └── admin.js        # Tracker logic, stats, CSV export
└── README.md           # This file
```

---

## ✨ Customization Tips

### Update Event Details

Edit `index.html` and `rsvp.html` to change:
- Date, time, location
- Event description
- Activities

### Change Colors

All colors are CSS variables in `css/style.css`:

```css
:root {
  --red:     #e63946;
  --orange:  #f4a261;
  --yellow:  #f9c74f;
  --green:   #43aa8b;
  --blue:    #4361ee;
  --purple:  #7b2d8b;
  --teal:    #0096c7;
  --dark:    #1a1a2e;
  --light:   #fefae0;
  --white:   #ffffff;
}
```

### Add/Remove T-Shirt Sizes

Edit the `SIZES` array in `js/rsvp.js` (line 8):

```javascript
const SIZES = ['XS','S','M','L','XL','2XL','3XL','Youth S','Youth M','Youth L'];
```

### Update Family Branches

Edit both `rsvp.html` (line 91) and `admin.html` (line 108):

```html
<option value="Branch A">Branch A</option>
<option value="Branch B">Branch B</option>
<!-- Add more branches here -->
```

---

## 📊 Tracker Page (Admin)

Access the guest tracker at:  
`https://YOUR-SITE.github.io/admin.html`

**Features:**
- Real-time stats (total, attending, maybe, declined)
- T-shirt size summary
- Branch breakdown
- Search, filter, and sort
- Export to CSV
- Edit/delete individual entries

**Note:** Data is stored in **browser LocalStorage**. It's perfect for small events, but won't sync across devices. For multi-device access, consider integrating a backend (Airtable, Google Sheets API, or Firebase).

---

## 🎨 Design Credits

- **Fonts:** [Google Fonts](https://fonts.google.com) – Pacifico, Nunito, Dancing Script
- **Hero Image:** [Unsplash](https://unsplash.com)
- **Icons:** Native emoji 🎉

---

## 📞 Support

Questions? Reach out to the organizer or open an issue on GitHub.

---

## ❤️ Made with Love for the Spears Family

**Event Date:** Saturday, September 5, 2026  
**Location:** Tilles Park, 9551 Litzsinger Rd, St. Louis, MO 63124  
**Time:** 12:00 PM – 4:00 PM

_"Family is not an important thing. It's everything."_
