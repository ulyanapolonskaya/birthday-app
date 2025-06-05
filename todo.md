Here’s a **detailed to-do list** with checkboxes for your "Family Birthdays" project, based on your clarified scope:

---

## ✅ **Project: Family Birthdays App**

### 🔧 **1. Project Setup**

* [x] Create GitHub repository
* [ ] Set up project with Vite + React + TypeScript (or plain JS if preferred)
* [ ] Configure dark theme with global styles
* [ ] Add favicon and page title
* [ ] Add README with short project description and instructions

---

### 🖼️ **2. UI: Birthday List Page**

* [ ] Create homepage layout (`Home.tsx` or `index.html`)
* [ ] Display list of people with:

  * [ ] Name
  * [ ] Birthday (DD/MM or MM/DD)
  * [ ] Calculated “in X days”
  * [ ] Optional: show age if year is provided
* [ ] Sort list by upcoming birthdays
* [ ] Highlight today's birthdays

---

### ➕ **3. Add Birthday Feature**

* [ ] Add button "Add Birthday"
* [ ] Create modal or form for input:

  * [ ] Name
  * [ ] Date of birth (calendar input)
* [ ] Validate date input (no future dates, correct format)
* [ ] Add data to frontend list
* [ ] Update backend JSON (see Data Handling section)

---

### 📝 **4. Edit & Delete Features**

* [ ] Enable editing an entry:

  * [ ] Pre-fill form on click
  * [ ] Save changes to JSON
* [ ] Enable deleting an entry:

  * [ ] Add delete button with confirmation

---

### 📁 **5. Data Handling (JSON-based “Backend”)**

* [ ] Create `birthdays.json` file with initial sample data
* [ ] Fetch `birthdays.json` on app load
* [ ] Store added/edited data in localStorage for write simulation
* [ ] Optional: Add “Download JSON” or “Copy JSON” button to share updates manually with others

---

### 🎨 **6. Styling & Theme**

* [ ] Apply dark theme using soft, accessible colors
* [ ] Use large readable fonts and spacing
* [ ] Add subtle hover/active states for buttons
* [ ] Style birthday cards or rows with soft shadows/rounded corners
* [ ] Ensure mobile responsiveness

---

### 🌐 **7. Deployment**

* [ ] Build app for production
* [ ] Push to `gh-pages` branch or configure GitHub Pages via Settings
* [ ] Test live link
* [ ] Share link with family

---

### 🚧 **8. Optional Future Enhancements**

* [ ] Add birthday countdown per person
* [ ] Add photo upload per person (local only)
* [ ] Sync JSON with GitHub Gist or Firebase for real-time shared backend
* [ ] Birthday notification system (email or local)
* [ ] Export/import full list as `.json` or `.csv`

---

Let me know if you'd like a pre-filled `birthdays.json` example or help planning the file structure!
