# 🚧 Invoice Generator (Work in Progress)

> **Note:** This project is currently under active development. Features and functionality may change.

A modern, customizable invoice generator built with React and Vite. Create professional invoices with live preview and export to PDF with support for both light and dark themes.

![Invoice Generator](https://img.shields.io/badge/status-under%20development-yellow)
![React](https://img.shields.io/badge/React-18+-blue)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF)

## ✨ Features

- 🎨 **Dual Theme Support** - Independent themes for UI and PDF output (Light/Dark/System)
- 📄 **Live Preview** - Real-time invoice preview as you type
- 💾 **Auto-Save** - Automatic localStorage backup of your work
- 🔧 **Customizable Fields** - Toggle 16+ optional fields on/off
- 📊 **Dynamic Calculations** - Automatic subtotal, tax, discount, and total calculations
- 💰 **Multi-Currency** - Support for USD, EUR, GBP, INR, JPY, AUD, CAD
- 🖼️ **Logo Upload** - Add your company logo
- 📱 **Responsive Design** - Works on desktop and mobile
- ⌨️ **Keyboard Shortcuts** - `Cmd/Ctrl + Enter` to generate PDF
- 🔀 **Drag & Drop** - Reorder invoice sections
- 📋 **Standard Terms** - Pre-filled professional payment terms
- 🧹 **Clear Invoice** - One-click reset functionality

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TirthDhandhukia30/invoicegen.git
cd invoicegen
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **PDF Generation:** jsPDF + html2canvas
- **Date Handling:** date-fns
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React

## 📦 Project Structure

```
invoice/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   └── theme-provider.jsx
│   ├── lib/            # Utility functions
│   ├── App.jsx         # Main app component
│   ├── LandingPage.jsx # Landing page
│   ├── InvoiceGenerator.jsx # Invoice generator
│   └── main.jsx        # Entry point
├── components.json     # shadcn/ui config
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Key Features in Detail

### Field Management
Toggle any of these fields on/off:
- Company Name & Address
- Contact Information (Website, Email, Phone)
- Client Name & Address
- Invoice Number & Title
- Currency Selection
- Date & Due Date
- Notes
- Logo
- Tax/GST Rate
- Discount
- Payment Information (Bank details, BSB/IFSC)
- Terms & Conditions

### PDF Export
- High-quality PDF generation
- Independent theme for PDF (separate from UI)
- Multi-page support for long invoices
- Consistent rendering across devices

### Auto-Save
Your invoice data is automatically saved to localStorage as you work, so you never lose your progress.

## 🎨 Customization

The project uses Tailwind CSS and shadcn/ui components, making it easy to customize:

1. **Colors:** Edit `tailwind.config.js` or use the theme toggle
2. **Components:** Modify components in `src/components/ui/`
3. **Invoice Layout:** Customize sections in `InvoiceGenerator.jsx`

## 🐛 Known Issues

- PDF generation is being optimized for better rendering
- Some edge cases in multi-page PDF exports need refinement

## 🤝 Contributing

Contributions are welcome! Since this is a work in progress, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tirth Dhandhukia**

- GitHub: [@TirthDhandhukia30](https://github.com/TirthDhandhukia30)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icon set

---

⭐ If you find this project useful, please consider giving it a star!
