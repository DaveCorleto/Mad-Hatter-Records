# Mad Hatter Records

Music portfolio website built to showcase original compositions, guitar-driven ideas and creative audio projects.

## 🌐 Live Demo

👉 https://mad-hatter-records.web.app

---

## 📸 Preview

### Homepage

![Homepage](./assets/home.png)

### Gear (API-driven content)

![Gear](./assets/gear.png)

---

## 🧠 Overview

This project combines a static frontend with a backend API to deliver dynamic content in a simple and scalable way.

It represents a practical exercise in structuring and deploying a small full-stack application on Google Cloud.

---

## 🏗 Architecture

* **Frontend** → Static website served via Firebase Hosting
* **Backend API** → Node.js (Express) service deployed on Google Cloud Run
* **Communication** → Frontend fetches data dynamically from the API

```
[ Browser ]
     ↓
[ Firebase Hosting ]
     ↓
[ Cloud Run API ]
```

---

## ⚙️ Tech Stack

* HTML / CSS
* JavaScript (Vanilla)
* Node.js (Express)
* Firebase Hosting
* Google Cloud Run
* Git & GitHub

---

## 📁 Project Structure

```
/
├── public/        # Static frontend (HTML, CSS, JS)
├── gear-api/      # Backend API (Node.js)
├── firebase.json  # Firebase configuration
├── .firebaserc    # Firebase project settings
```

---

## 🚀 Running Locally

### Frontend

```bash
cd public
# open index.html or use a local server
```

### Backend

```bash
cd gear-api
npm install
node server.js
```

---

## 💡 Purpose

This project was built to:

* practice cloud deployment workflows
* structure a simple full-stack architecture
* integrate frontend and backend components
* create a deployable personal portfolio

---

## 👤 Author

Davide Corleto


