# 📦 Demo – Express & EJS

This is a simple Node.js application using **Express** and **EJS** to render a basic index page. It demonstrates how to serve dynamic content using server-side templates.

---

## 🚀 Features

- Express server setup
- EJS templating engine
- Static file serving
- CORS and body parsing middleware
- Environment variable support via `dotenv`

---

## 📁 Project Structure

```
├── public/           # Static assets (CSS, JS, images)
├── views/            # EJS templates
│   └── index.ejs     # Main view
├── server.js         # Main server file
├── .env              # Environment variables (optional)
├── package.json      # Project metadata and scripts
└── README.md         # Project documentation
```

---

## 🛠️ Installation

1. Install dependencies:

   ```bash
   npm install
   ```

---

## ▶️ Running the Server

You can start the server in two ways:

### Option 1: Directly with Node

```bash
node server.js
```

### Option 2: Using NPM Script

```bash
npm run start
```

> Make sure your `package.json` includes the following script:

```json
"scripts": {
  "start": "node server.js"
}
```

---

## 🌐 Access the App

Once running, open your browser and go to:

```
http://localhost:3001
```

You should see a welcome message rendered from the EJS template.

---

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
