# SmartCalc — Traditional + Modern Scientific Calculator 🧮✨

> A responsive, high-precision web calculator application built from scratch with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No frameworks, no external libraries, zero dependencies.

---

## 📸 Overview & Design System

**SmartCalc** combines the instant tactile familiarity of a physical desk calculator with the ergonomics of a modern scientific calculation workspace. Engineered with:
- **Dark Navy & Blue-Purple Gradient Accents**: Premium glassmorphism aesthetics with smooth light refraction.
- **Dual Themes**: Complete Dark & Light theme suites with saved user preferences.
- **Chained & Precedence Calculations**: Floating-point precision stabilization solving classical JavaScript arithmetic errors (e.g., `0.1 + 0.2 = 0.3`).
- **Zero `eval()`**: A safe, tokenized, and deterministic mathematical engine built entirely on native `Math` methods.
- **Scientific Suite**: Trigonometric (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`), powers (`xʸ`, `x²`), logarithms (`log₁₀`, `ln`), factorial (`n!`), and constants ($\pi$, $e$).
- **Persistent Calculation History**: LocalStorage-backed calculation log with one-tap result recall.
- **Hardware Keyboard Support**: Complete tactile desktop navigation for keyboard warriors.

---

## 🚀 Key Features

### 1. Traditional Calculator Engine
- **Basic Operations**: Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`).
- **Percentage Calculation (`%`)**: Standalone percentage parsing as well as relative chained percentages (e.g., `200 + 10% = 220`).
- **Sign Inversion (`±`)**: Effortlessly switch positive and negative signs.
- **Correction Tools**: All Clear (`AC`) and Backspace / Delete (`DEL`).
- **Division by Zero Protection**: Clean, user-friendly exception handling (`Cannot divide by zero`).
- **Continuous Operations**: Seamlessly chain calculations using the previously evaluated output.

### 2. Modern Scientific Capabilities
- **Trigonometric Functions**: Sine, Cosine, Tangent and their Arc inverses with **DEG (Degree) / RAD (Radian)** mode switching.
- **Exponential & Powers**: $x^y$, $x^2$, $\sqrt{x}$, and reciprocal $1/x$.
- **Advanced Math**: Factorial $n!$, Common Log ($\log_{10}$), Natural Log ($\ln$).
- **Mathematical Constants**: High-precision $\pi$ (Pi) and $e$ (Euler's number).

### 3. Productivity & UX Accents
- **Memory Stack**: `MC` (Clear), `MR` (Recall), `M+` (Add), and `M-` (Subtract) with an active screen indicator.
- **Live Expression Preview**: Displays computed preview before pressing `=`.
- **One-Click Clipboard Copy**: Export calculation results to clipboard with toast notifications.
- **Calculation History Drawer**: History log with timestamps; click or tap any item to instantly load its answer into the active input.
- **Glassmorphism & Responsive Layout**: Tailored for 4K desktop screens, laptops, tablets, and phones.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Operation |
| :--- | :--- |
| `0` – `9` | Input numerical digits |
| `.` | Input decimal point |
| `+`, `-`, `*`, `/` | Add, Subtract, Multiply, Divide |
| `^` | Power ($x^y$) |
| `%` | Calculate percentage |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last entered digit |
| `Escape` or `c` / `C` | All Clear (`AC`) |

---

## 📁 Project Folder Structure

```text
SmartCalc/
├── assets/
│   └── favicon.svg       # Vector logo & modern browser favicon
├── index.html            # Semantic HTML5 document structure
├── style.css             # Glassmorphism styling, CSS variables & themes
├── script.js             # Pure ES6+ calculator engine & state manager
└── README.md             # Project documentation & deployment guide
```

---

## 🛠️ How to Run Locally in VS Code

### Method 1: Using VS Code "Live Server" (Recommended)
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and pick the `SmartCalc` project folder.
3. If you haven't already, install the **Live Server** extension by *Ritwick Dey* from the VS Code Marketplace:
   - Shortcut: `Ctrl + Shift + X` -> Search for `Live Server` -> Click **Install**.
4. Right-click on `index.html` in the Explorer tree and select **"Open with Live Server"**.
5. Your browser will automatically launch at `http://127.0.0.1:5500/index.html` with hot-reload enabled.

### Method 2: Direct Browser Launch
Simply double-click `index.html` in your file explorer (or right-click -> *Open With* -> *Google Chrome* / *Microsoft Edge* / *Firefox*).

---

## 🧪 Testing Checklist Verified

- [x] `10 + 5 = 15`
- [x] `20 - 8 = 12`
- [x] `7 × 6 = 42`
- [x] `15 ÷ 3 = 5`
- [x] `0.1 + 0.2 = 0.3` (Precision error mitigated)
- [x] `200 + 10% = 220` & `50% = 0.5`
- [x] Sign toggling: `9` -> `±` = `-9`
- [x] Division by zero displays `Cannot divide by zero`
- [x] Chained calculations: `5 + 5 * 2 = 20` (sequential chaining)
- [x] Full keyboard interaction support
- [x] Degree & Radian trigonometry: `sin(30°) = 0.5`, `cos(0°) = 1`
- [x] Memory persistence: `M+`, `MR`, `MC`
- [x] LocalStorage persistence for Theme and History across browser refreshes
- [x] Clipboard copy working with floating toast alert
- [x] Mobile drawer and responsive grid on all viewports

---

## 🌐 Deployment Instructions

### 1. Deploying to GitHub Pages (Free)
1. Initialize git in your local project folder:
   ```bash
   git init
   git add .
   git commit -m "feat: complete SmartCalc web application"
   ```
2. Create a new repository on your GitHub account named `smartcalc`.
3. Link your local project to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/smartcalc.git
   git push -u origin main
   ```
4. On GitHub, navigate to **Settings** > **Pages**.
5. Under **Build and deployment > Branch**, select `main` and `/ (root)`, then click **Save**.
6. Within 1–2 minutes, your project will be live at:
   `https://<your-username>.github.io/smartcalc/`

### 2. Deploying to Vercel (Free)
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import your `smartcalc` repository.
4. Leave build settings as default (static site).
5. Click **Deploy**. Vercel will provide an instant global HTTPS URL (e.g. `smartcalc.vercel.app`).

---

## 🔮 Future Improvements
- [ ] Unit conversion suite (Length, Weight, Temperature, Currency).
- [ ] Graphing calculator plotting mode for functions $f(x)$.
- [ ] Sound effects toggle for physical tactile keyboard clicks.
- [ ] Multi-line formula brackets `(` and `)`.

---

## 📄 License & Credits
Developed with pure web standards (HTML5, CSS3, ES6+). Free for portfolio showcases, educational use, and personal projects.

