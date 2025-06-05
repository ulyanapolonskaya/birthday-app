**Project Title: Family Birthdays App**

---

**Overview:**
A minimal, visually pleasing web application to view and manage birthdays of relatives. The app is shareable with family and deployed for free on GitHub Pages. It uses a JSON file as the backend data source.

---

**Core Features:**

1. **Birthday List View**

   * Displays a list of all birthdays, sorted by upcoming date (day/month).
   * Each entry shows:

     * Full name
     * Date of birth (e.g., "June 10")
     * Age (optional, if year is provided)
     * Optional: "X days left" until next birthday
   * Highlights birthdays that are today

2. **Add / Edit / Delete Entries**

   * Form to add a new person with fields:

     * Name (text input)
     * Date of Birth (date picker)
     * Notes (optional text area)
   * Edit existing entries via the same form
   * Delete functionality for each entry

3. **Dark Theme Design**

   * Background: #1c1c1e
   * Text: #e0e0e0
   * Accent colors: soft pastel tones (teal, rose, lavender)
   * Design: simple, rounded cards/lists, clean sans-serif fonts
   * Responsive layout for desktop and mobile

---

**Data Storage:**

* Uses a single `birthdays.json` file to store data.
* JSON format:

```json
[
  {
    "name": "Anna",
    "dob": "1990-06-10",
    "notes": "Loves chocolate cake"
  },
  {
    "name": "Max",
    "dob": "2005-07-03",
    "notes": ""
  }
]
```

* On app load, fetches data from the JSON file hosted in the repository.
* Changes to data (add/edit/delete) are local only in the browser (unless manually updated in the JSON).

---

**Deployment:**

* Hosted for free on **GitHub Pages**
* No backend server required
* Static frontend app (React/Vite or plain JS)
* JSON file stored in the `public` folder or root of the repo

---

**Limitations:**

* No user authentication
* Changes made by users are not persisted unless the JSON file is manually updated in the repo
* No notifications or reminders (can be added later)

---

**Future Improvements (Post-MVP):**

* Email or local notifications for upcoming birthdays
* Editable shared backend (e.g., via Supabase or Firebase)
* Animated confetti or highlight effect on today's birthdays
* CSV import/export

---

**Project Goals:**

* Easy to use and accessible for all family members
* Clean and calming visual design
* Free and low-maintenance deployment
* Simple structure for potential future upgrades

