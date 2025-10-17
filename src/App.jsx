import "./App.css";
import LandingPage from "./LandingPage";
import InvoiceGenerator from "./InvoiceGenerator";
import { ThemeProvider } from "./components/theme-provider";

import { useState } from "react";

function App() {
  const [showInvoice, setShowInvoice] = useState(false);
  const handleOpen = () => setShowInvoice(true);
  const handleBack = () => setShowInvoice(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="invoice-theme">
      {showInvoice ? (
        <InvoiceGenerator onBack={handleBack} />
      ) : (
        <LandingPage onOpen={handleOpen} />
      )}
    </ThemeProvider>
  );
}

export default App;
