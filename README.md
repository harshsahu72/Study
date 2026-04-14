<< HEAD >>
# StudyMind AI 🧠

**India's Most Complete Student AI Platform**

StudyMind AI is a state-of-the-art, AI-powered SaaS application built specifically for students. Re-architected with a modular React infrastructure and a robust Express backend, the platform features a stunning futuristic dark-theme interface with sleek glassmorphism elements, dynamic micro-animations, and uncompromised performance.

---

## 🔥 Features

StudyMind provides a complete ecosystem of 11 core interactive features for students:

1. **AI Note Generation** – Instantly condense topics into neat, highly readable notes.
2. **Doubt Solving** – Get your queries answered quickly with advanced AI assistance.
3. **Mock Tests** – Generate and practice complete mock tests for various subjects.
4. **Assignment Help** – Intelligent aid to assist you in writing and structuring assignments.
5. **Premium Subscription Flow** – Completely integrated premium user experience and access management.
   _(...and more intelligent student tools)_

## 🎨 UI & Design Architecture

- **Glassmorphism Aesthetic**: Rich semi-transparent cards, smooth blurs, and dynamic background gradients.
- **Micro-Animations**: Fluid CSS/JS-driven interactions that make the platform feel responsive and alive.
- **Modern Typography**: Highly legible and beautiful fonts tailored for long-form study material.

## 🛠 Tech Stack

- **Frontend**: React 19, JavaScript, Vanilla CSS (Design-System focused)
- **Backend / API**: Node.js, Express
- **State Management**: `localStorage` combined with modular React Context / Hooks
- **Tooling/Scripts**: `concurrently` to run both the Client & Server via a single command.

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation & Setup

1. **Clone the repository** (or navigate to your working directory):

   ```bash
   cd "study mind ai"
   ```

2. **Install all dependencies** (This installs both root, client, and server dependencies):
   ```bash
   npm install
   ```
   _(Note: For the client-specific dependencies, ensure you also run `npm install` inside the `client` directory if not automatically resolved)_

### Running the Application

To launch both the React frontend dev server and the Express backend concurrently, simply run:

```bash
npm start
```

- The **Client** will start globally on `http://localhost:3000`
- The **Server** will run seamlessly alongside it

## 📂 Project Structure

```text
study mind ai/
├── client/          # React App (Views, Components, CSS)
├── server/          # Node.js/Express Backend Core
├── package.json     # Interconnected Scripts & Concurrently config
└── README.md
```
**Harsh Kumar**
 | Student
 << Working on Frontend Designing
 << working on web developer

## 📝 License

ISC License
=======

