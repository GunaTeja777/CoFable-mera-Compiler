# 🦋 CoFable Studio — Fable 5 Inspiration

CoFable is a premium, lightweight, responsive, and completely browser-based multi-language IDE supporting both Python and Java. Built using the modern WebAssembly runtime (**Pyodide**) for Python, a custom client-side transpiler for Java, **CodeMirror 6**, **TypeScript**, and **Tailwind CSS v4**, it allows developers to write and run code with zero installations, local imports support via a Virtual File System, and interactive package installations from PyPI.

---

## ✨ Features

- 🐍 **WASM Python Runtime**: Full Python execution directly inside your browser powered by Pyodide (v0.25.0).
- ☕ **Java (Transpiled) Runner**: Write and run Java code client-side via a high-performance custom transpiler and runner. Includes mocks for popular Java utilities (`Scanner`, `ArrayList`, `HashMap`, `HashSet`, `StringBuilder`).
- 📂 **Virtual File System (VFS)**: Write code across multiple files (`main.py`, `Main.java`, `utils.py`), rename, delete, and import local modules seamlessly (changes are persisted in `localStorage`).
- 📦 **PyPI Package Installer**: Install external packages (like `numpy`, `requests`, `sympy`) directly from PyPI via `micropip` runtime bootstrap.
- 🎨 **Botanical Design Aesthetic**: A curated user interface supporting light/dark theme switching (Parchment vs. Charcoal), customized editor styling, and sleek typography (JetBrains Mono & Lato).
- 🦋 **Visual Delight animations**: Elegant butterfly micro-animations triggering on successful/error execution states.
- ⌨️ **Vim Mode & Keymaps**: Toggle keymaps from settings between standard and Vim bindings.
- 💻 **Offline & Static friendly**: Entirely client-side application requiring no server backend. Highly suitable for static hosting.

---

## 🛠️ Technology Stack

- **Core Framework**: Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Code Editor**: CodeMirror 6 (with Python and Java syntax parsing, autocomplete, active line highlighter, and responsive configurations)
- **Engine**: Pyodide (WASM) for Python; Custom transpiler sandbox for Java.

---

## 🚀 Getting Started

### Prerequisites

You only need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CoFable.git
   cd CoFable
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser to start writing code!

### Production Build

To compile and optimize the application for deployment:
```bash
npm run build
```
This will generate production-ready files in the `dist/` directory.

---

## 🌐 Deployment Options

Because CoFable is a fully client-side static application, you can host it for free on:
- **Vercel**
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

*For automated GitHub Actions deployment setups, refer to our [Deployment Guide](./artifacts/deploy_and_opensource_guide.md).*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
