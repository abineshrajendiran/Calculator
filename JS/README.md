# Smart Calculator Web Application 🧮✨

> A modern, responsive calculator web application built using **HTML5, CSS3, and Vanilla JavaScript**. Designed with a minimalist dark/light UI, zero external libraries, zero `eval()`, and clean code suitable for a fresher frontend developer portfolio and technical interview walkthrough.

---

## 📸 Project Overview

**SmartCalc** delivers a SaaS-inspired interface combined with high-precision arithmetic calculations.

- **Theme Design**: Modern dark theme with a navy/indigo gradient, ambient glowing accents, plus a crisp light mode toggle.
- **Precision Floating-Point Engine**: Prevents classical JavaScript float errors (e.g. `0.1 + 0.2 = 0.3`).
- **Calculation History Panel**: Automatically persists the last 10 calculations using `localStorage`. Tap any calculation to reuse its value.
- **Division by Zero Protection**: Clean, friendly error message without throwing JavaScript console errors.
- **Hardware Keyboard Support**: Complete tactile desktop navigation for keyboard users.
- **Accessible & Responsive**: Fully responsive layout across phones, tablets, and desktops with ARIA labels and focus indicators.

---

## 🚀 Features

### Basic Arithmetic Operations
- **Addition (`+`)**: Chained and single-step addition.
- **Subtraction (`−`)**: Real-time evaluation of negative and positive differences.
- **Multiplication (`×`)**: Clean product calculations.
- **Division (`÷`)**: Accurate division with friendly warning on zero divisor (`Cannot divide by zero`).
- **Decimal Numbers (`.`)**: Strict single-decimal validation per operand.
- **Percentage (`%`)**: 
  - Standalone: `50%` = `0.5`
  - Chained: `200 + 10%` = `220` (calculates 10% of 200, which is 20, then adds it).
- **Positive / Negative Sign Toggle (`±`)**: Quickly invert between positive and negative numbers.
- **Correction Tools**:
  - `AC` (All Clear): Clears all current and pending operations.
  - `DEL` (Backspace): Deletes the last digit entered.

### Advanced User Experience
- **Hardware Keyboard Controls**: Type with number keys, `+ - * /`, `Enter`, `Backspace`, and `Escape`.
- **Button Press Feedback**: Visual pulse animation on both mouse clicks and keyboard taps.
- **Previous Operation Display**: Shows the previous number and selected operator above the current input.
- **One-Click Clipboard Copy**: Copy active results to the clipboard with floating toast notification.
- **Calculation History (Last 10)**: 
  - Click any entry to reload its result into the calculator.
  - "Clear" button to wipe history.
  - Polite empty state placeholder when no history exists.
  - Saved in browser `localStorage` across refreshes.
- **Dark & Light Mode Switcher**: Seamless instant theme toggle with saved preferences.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Calculator Action |
| :--- | :--- |
| `0` – `9` | Enter numbers |
| `.` | Enter decimal point |
| `+`, `-`, `*`, `/` | Add, Subtract, Multiply, Divide |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit (DEL) |
| `Escape` or `c` / `C` | Clear all (AC) |
| `%` | Calculate percentage |

---

## 📁 Project Folder Structure

```text
calculator-project/
├── index.html            # Semantic HTML5 page structure
├── css/
│   └── style.css         # Modern styling, CSS variables & themes
├── js/
│   └── script.js         # Pure Vanilla JavaScript calculation logic
├── assets/
│   └── favicon.svg       # Vector brand logo & browser favicon
├── screenshots/
│   └── (placeholders or instructions for screenshots)
└── README.md             # Complete documentation and interview guide
```

---

## 🛠️ How to Run the Project Locally

### Method 1: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose this project directory.
3. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Extensions tab (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd>).
4. Right-click on `index.html` and choose **"Open with Live Server"**.
5. The project will open in your default browser at `http://127.0.0.1:5500/`.

### Method 2: Direct Browser Launch
Simply double-click `index.html` in your file explorer (or right-click `index.html` -> **Open with** -> Google Chrome, Microsoft Edge, or Firefox). No build step, Node.js, or server installation is required!

---

## 🧪 Verified Test Cases

The application has been verified against all standard mathematical test cases:

- [x] **10 + 5** = `15`
- [x] **20 - 8** = `12`
- [x] **6 × 7** = `42`
- [x] **20 ÷ 4** = `5`
- [x] **10 ÷ 0** = `Cannot divide by zero` (Friendly message, no JS crashes)
- [x] **5.5 + 2.5** = `8`
- [x] **50%** = `0.5`
- [x] **Sign Toggle**: `25` -> `±` = `-25` -> `±` = `25`
- [x] **DEL & AC**: Backspacing removes single digits; `AC` resets all state to `0`
- [x] **Keyboard Input**: Digits, operations, Backspace, Enter, Esc work seamlessly
- [x] **Theme Persistence**: Switching to Light Theme and refreshing browser keeps Light Theme active
- [x] **History Persistence**: Last 10 calculations survive page reloads and can be reloaded on click
- [x] **Responsive Layout**: Tested on mobile viewports (slide-out drawer) and desktop viewports

---

## 📷 Screenshots Instructions

To add screenshots of your own project:
1. Open the calculator in your browser (press <kbd>F11</kbd> for fullscreen or resize for mobile).
2. Take screenshots of:
   - **Dark Theme Desktop**: `screenshots/desktop-dark.png`
   - **Light Theme Desktop**: `screenshots/desktop-light.png`
   - **Mobile Viewport**: `screenshots/mobile-view.png`
   - **History Panel In-use**: `screenshots/history-active.png`
3. Save the image files inside the `screenshots/` folder.
4. Reference them in this README using markdown:
   ```markdown
   ![SmartCalc Dark Theme](screenshots/desktop-dark.png)
   ```

---

## 🌐 GitHub Upload & Deployment Instructions

### Upload to GitHub
1. Open your terminal in the project folder:
   ```bash
   git init
   git add .
   git commit -m "feat: complete modern smart calculator web app"
   ```
2. Create a new repository on [GitHub](https://github.com) named `smart-calculator`.
3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/smart-calculator.git
   git push -u origin main
   ```

### Deploy to GitHub Pages (Free)
1. Go to your repository on GitHub.
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**. Within 1–2 minutes, your live site will be accessible at:
   `https://<your-username>.github.io/smart-calculator/`

### Deploy to Vercel (Free)
1. Log in to [Vercel](https://vercel.com) with GitHub.
2. Click **Add New...** > **Project** and import `smart-calculator`.
3. Keep default settings and click **Deploy**.

---

## 🔮 Future Enhancement Ideas
- Sound effects toggle for tactile click audio.
- Scientific mode toggle for trigonometric operations ($\sin$, $\cos$, $\tan$, $\sqrt{x}$).
- Unit converter (currency, length, temperature).

---

## 📄 License
Open source and free to use for student portfolios, personal projects, and learning.
