import "./App.css";
import LandingPage from "./LandingPage";
import InvoiceGenerator from "./InvoiceGenerator";
import { ThemeProvider } from "./components/theme-provider";
import SupabaseAuth from "./components/auth";

import { useState } from "react";

function App() {
  const [session, setSession] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [, setInitializing] = useState(true); // handled by SupabaseAuth
  const handleOpen = () => setShowInvoice(true);
  const handleBack = () => setShowInvoice(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="invoice-theme">
      <SupabaseAuth
        onSession={setSession}
        onInitializing={setInitializing}
      >
        {/* Render invoice or landing page if session exists */}
        {session ? (
          showInvoice ? (
            <InvoiceGenerator onBack={handleBack} />
          ) : (
            <LandingPage onOpen={handleOpen} />
          )
        ) : null}
      </SupabaseAuth>
    </ThemeProvider>
  );
}

export default App;
