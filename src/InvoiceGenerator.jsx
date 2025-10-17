import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import {
  Building2,
  User,
  Hash,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Image,
  Percent,
  Moon,
  Sun,
} from "lucide-react";

export default function InvoiceGenerator({ onBack }) {
  const { theme } = useTheme();
  // All useState declarations first
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: "", discount: 0 },
  ]);
  const [logo, setLogo] = useState("");
  const [taxRate, setTaxRate] = useState(10); // GST/Tax rate as percentage
  const [discount, setDiscount] = useState(0); // Overall discount

  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [routingNumber, setRoutingNumber] = useState(""); // BSB/IFSC/Routing
  const [terms, setTerms] = useState("");

  const [sectionOrder, setSectionOrder] = useState([
    "header",
    "companyInfo",
    "invoiceDetails",
    "items",
    "totals",
  ]);

  // State for PDF theme (independent of UI theme)
  const [pdfTheme, setPdfTheme] = useState("dark");

  // State for optional fields visibility
  const [activeFields, setActiveFields] = useState({
    companyName: true,
    companyAddress: true,
    companyContact: true,
    clientName: true,
    clientAddress: true,
    invoiceNumber: true,
    invoiceTitle: true,
    currency: true,
    date: true,
    dueDate: true,
    notes: true,
    logo: true,
    tax: true,
    discount: true,
    payment: true,
    terms: true,
  });

  // Available optional fields configuration
  const optionalFields = {
    companyName: { label: "Company Name", icon: Building2 },
    companyAddress: { label: "Company Address", icon: Building2 },
    companyContact: { label: "Contact Info", icon: Building2 },
    clientName: { label: "Client Name", icon: User },
    clientAddress: { label: "Client Address", icon: User },
    invoiceNumber: { label: "Invoice Number", icon: Hash },
    invoiceTitle: { label: "Invoice Title", icon: FileText },
    currency: { label: "Currency", icon: DollarSign },
    date: { label: "Date", icon: Calendar },
    dueDate: { label: "Due Date", icon: Clock },
    notes: { label: "Notes", icon: FileText },
    logo: { label: "Logo", icon: Image },
    tax: { label: "Tax/GST", icon: Percent },
    discount: { label: "Discount", icon: Percent },
    payment: { label: "Payment Info", icon: DollarSign },
    terms: { label: "Terms", icon: FileText },
  };

  // Toggle field visibility
  const toggleField = (fieldName) => {
    setActiveFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));

    // Clear the field value when hiding
    if (activeFields[fieldName]) {
      switch (fieldName) {
        case "companyName":
          setCompanyName("");
          break;
        case "companyAddress":
          setCompanyAddress("");
          break;
        case "companyContact":
          setCompanyWebsite("");
          setCompanyEmail("");
          setCompanyPhone("");
          break;
        case "clientName":
          setClientName("");
          break;
        case "clientAddress":
          setClientAddress("");
          break;
        case "invoiceNumber":
          setInvoiceNumber("");
          break;
        case "invoiceTitle":
          setInvoiceTitle("");
          break;
        case "currency":
          setCurrency("USD");
          break;
        case "date":
          setDate(null);
          break;
        case "dueDate":
          setDueDate(null);
          break;
        case "notes":
          setNotes("");
          break;
        case "logo":
          setLogo("");
          break;
        case "tax":
          setTaxRate(10);
          break;
        case "discount":
          setDiscount(0);
          break;
        case "payment":
          setPaymentMethod("");
          setBankName("");
          setAccountNumber("");
          setAccountName("");
          setRoutingNumber("");
          break;
        case "terms":
          setTerms("");
          break;
        default:
          break;
      }
    }
  };

  // Currency symbols
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
  };

  // useRef
  const previewRef = useRef(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculations (after items is defined)
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * (parseFloat(item.price) || 0),
    0
  );
  const totalDiscount = activeFields.discount
    ? items.reduce(
        (sum, item) =>
          sum +
          item.quantity * (parseFloat(item.price) || 0) * (item.discount / 100),
        0
      ) +
      (subtotal * discount) / 100
    : 0;
  const afterDiscount = subtotal - totalDiscount;
  const tax = activeFields.tax ? afterDiscount * (taxRate / 100) : 0;
  const grandTotal = afterDiscount + tax;

  // Standard payment terms template
  const standardTerms =
    "Payment is due within 30 days of invoice date. Late payments may incur interest charges at 1.5% per month. All prices are in the specified currency and are non-refundable. Please include the invoice number with your payment. Thank you for your business.";

  // Load invoice data from localStorage on mount
  useEffect(() => {
    const savedInvoice = localStorage.getItem("currentInvoice");
    if (savedInvoice) {
      try {
        const data = JSON.parse(savedInvoice);
        setCompanyName(data.companyName || "");
        setCompanyAddress(data.companyAddress || "");
        setCompanyWebsite(data.companyWebsite || "");
        setCompanyEmail(data.companyEmail || "");
        setCompanyPhone(data.companyPhone || "");
        setClientName(data.clientName || "");
        setClientAddress(data.clientAddress || "");
        setInvoiceNumber(data.invoiceNumber || "");
        setInvoiceTitle(data.invoiceTitle || "");
        setDate(data.date ? new Date(data.date) : null);
        setDueDate(data.dueDate ? new Date(data.dueDate) : null);
        setNotes(data.notes || "");
        setCurrency(data.currency || "USD");
        setItems(
          data.items || [
            { description: "", quantity: 1, price: "", discount: 0 },
          ]
        );
        setLogo(data.logo || "");
        setTaxRate(data.taxRate || 10);
        setDiscount(data.discount || 0);
        setPaymentMethod(data.paymentMethod || "");
        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountName(data.accountName || "");
        setRoutingNumber(data.routingNumber || "");
        setTerms(data.terms || "");
        if (data.activeFields) setActiveFields(data.activeFields);
        if (data.pdfTheme) setPdfTheme(data.pdfTheme);
      } catch (error) {
        console.error("Error loading saved invoice:", error);
      }
    }
  }, []);

  // Save invoice data to localStorage whenever it changes
  useEffect(() => {
    const invoiceData = {
      companyName,
      companyAddress,
      companyWebsite,
      companyEmail,
      companyPhone,
      clientName,
      clientAddress,
      invoiceNumber,
      invoiceTitle,
      date: date ? date.toISOString() : null,
      dueDate: dueDate ? dueDate.toISOString() : null,
      notes,
      currency,
      items,
      logo,
      taxRate,
      discount,
      paymentMethod,
      bankName,
      accountNumber,
      accountName,
      routingNumber,
      terms,
      activeFields,
      pdfTheme,
    };
    localStorage.setItem("currentInvoice", JSON.stringify(invoiceData));
  }, [
    companyName,
    companyAddress,
    companyWebsite,
    companyEmail,
    companyPhone,
    clientName,
    clientAddress,
    invoiceNumber,
    invoiceTitle,
    date,
    dueDate,
    notes,
    currency,
    items,
    logo,
    taxRate,
    discount,
    paymentMethod,
    bankName,
    accountNumber,
    accountName,
    routingNumber,
    terms,
    activeFields,
    pdfTheme,
  ]);

  // Get theme colors for PDF
  const getThemeColors = useCallback(
    (themeOverride = null) => {
      // If themeOverride is provided, use it. Otherwise use the current UI theme.
      const themeToUse = themeOverride || theme;
      const isDark =
        themeToUse === "dark" ||
        (themeToUse === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isDark) {
        return {
          background: "#000000",
          cardBackground: "#1A1A1A",
          text: "#ffffff",
          textSecondary: "rgba(255, 255, 255, 0.7)",
          textMuted: "rgba(255, 255, 255, 0.8)",
          border: "rgba(255, 255, 255, 0.1)",
          borderStrong: "rgba(255, 255, 255, 0.2)",
        };
      } else {
        return {
          background: "#ffffff",
          cardBackground: "#ffffff",
          text: "#000000",
          textSecondary: "#000000",
          textMuted: "#000000",
          border: "#000000",
          borderStrong: "#000000",
        };
      }
    },
    [theme]
  );

  /**
   * PDF Export with correct pixel-to-millimeter conversion.
   *
   * html2canvas renders the DOM to a high-resolution pixel canvas (scale: 3).
   * jsPDF works in millimeters. When slicing multi-page content, we must
   * convert between these units consistently to prevent cut-off pages.
   *
   * Formula: pxPerMm = canvas.height / imgHeightInMM
   * Then slice canvas in pixels: pagePx = pageMm * pxPerMm
   */
  const handleGeneratePDF = useCallback(async () => {
    const input = previewRef.current;
    if (!input) {
      alert("Preview not found");
      return;
    }

    const themeColors = getThemeColors(pdfTheme);

    try {
      // Generate canvas from preview - use scale 2 for better quality
      const canvas = await html2canvas(input, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: themeColors.background,
        onclone: (clonedDoc) => {
          // Set fixed width in the cloned document for consistent PDF
          const clonedInput = clonedDoc.querySelector(
            "[data-html2canvas-ignore-global-styles]"
          );
          if (clonedInput) {
            clonedInput.style.width = "800px";
            clonedInput.style.maxHeight = "none";
            clonedInput.style.overflow = "visible";
            clonedInput.style.height = "auto";
            clonedInput.style.minHeight = input.scrollHeight + 150 + "px"; // Add 150px buffer
          }
          // Remove all stylesheets to prevent oklch colors from being applied
          const stylesheets = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]'
          );
          stylesheets.forEach((sheet) => sheet.remove());

          // Ensure the cloned preview element keeps its inline styles
          const clonedPreview = clonedDoc.querySelector(
            "[data-html2canvas-ignore-global-styles]"
          );
          if (clonedPreview) {
            clonedPreview.style.backgroundColor = themeColors.background;
            clonedPreview.style.color = themeColors.text;
            clonedPreview.style.borderColor = themeColors.borderStrong;

            // Get current UI theme colors to know what to replace
            const currentUIColors = getThemeColors();

            // Update all elements with inline styles to use PDF theme colors
            const allElements = clonedPreview.querySelectorAll("*");
            allElements.forEach((el) => {
              const style = el.style;

              // Helper function to replace color values
              const replaceColor = (colorStr) => {
                if (!colorStr) return colorStr;

                // Replace specific color values from UI theme to PDF theme
                let newColor = colorStr;

                // Text colors
                if (colorStr.includes(currentUIColors.text)) {
                  newColor = colorStr.replace(
                    currentUIColors.text,
                    themeColors.text
                  );
                }
                if (colorStr.includes(currentUIColors.textSecondary)) {
                  newColor = colorStr.replace(
                    currentUIColors.textSecondary,
                    themeColors.textSecondary
                  );
                }
                if (colorStr.includes(currentUIColors.textMuted)) {
                  newColor = colorStr.replace(
                    currentUIColors.textMuted,
                    themeColors.textMuted
                  );
                }

                // Border colors
                if (colorStr.includes(currentUIColors.border)) {
                  newColor = colorStr.replace(
                    currentUIColors.border,
                    themeColors.border
                  );
                }
                if (colorStr.includes(currentUIColors.borderStrong)) {
                  newColor = colorStr.replace(
                    currentUIColors.borderStrong,
                    themeColors.borderStrong
                  );
                }

                // Background colors
                if (colorStr.includes(currentUIColors.background)) {
                  newColor = colorStr.replace(
                    currentUIColors.background,
                    themeColors.background
                  );
                }
                if (colorStr.includes(currentUIColors.cardBackground)) {
                  newColor = colorStr.replace(
                    currentUIColors.cardBackground,
                    themeColors.cardBackground
                  );
                }

                return newColor;
              };

              // Update color properties
              if (style.color) style.color = replaceColor(style.color);
              if (style.backgroundColor)
                style.backgroundColor = replaceColor(style.backgroundColor);

              // Update border properties
              if (style.border) style.border = replaceColor(style.border);
              if (style.borderColor)
                style.borderColor = replaceColor(style.borderColor);
              if (style.borderTop)
                style.borderTop = replaceColor(style.borderTop);
              if (style.borderBottom)
                style.borderBottom = replaceColor(style.borderBottom);
              if (style.borderLeft)
                style.borderLeft = replaceColor(style.borderLeft);
              if (style.borderRight)
                style.borderRight = replaceColor(style.borderRight);
              if (style.borderTopColor)
                style.borderTopColor = replaceColor(style.borderTopColor);
              if (style.borderBottomColor)
                style.borderBottomColor = replaceColor(style.borderBottomColor);
              if (style.borderLeftColor)
                style.borderLeftColor = replaceColor(style.borderLeftColor);
              if (style.borderRightColor)
                style.borderRightColor = replaceColor(style.borderRightColor);
            });
          }
        },
      });

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

      // Create PDF - simpler approach
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // A4 dimensions
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Use smaller margins for more content space
      const margin = 5;
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;

      // Calculate the aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;

      let imgWidth = contentWidth;
      let imgHeight = contentWidth / canvasAspectRatio;

      // If image is taller than one page
      if (imgHeight > contentHeight) {
        // Calculate how many pages we need
        const pageCount = Math.ceil(imgHeight / contentHeight);
        console.log("Pages needed:", pageCount);

        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          // Calculate source and destination for this page
          const srcHeight = canvas.height / pageCount;
          const srcY = i * srcHeight;

          // We need to slice the original canvas
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(srcHeight, canvas.height - srcY);

          const ctx = pageCanvas.getContext("2d");
          ctx.fillStyle = themeColors.background;
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          ctx.drawImage(
            canvas,
            0,
            srcY,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = contentWidth / canvasAspectRatio / pageCount;

          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            contentWidth,
            Math.min(pageImgHeight, contentHeight),
            undefined,
            "FAST"
          );
        }
      } else {
        // Single page - simple case
        const imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
      }

      pdf.save(`invoice-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  }, [getThemeColors, pdfTheme]);

  // Clear invoice handler
  const handleClearInvoice = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the current invoice? This will reset all fields."
      )
    ) {
      setCompanyName("");
      setCompanyAddress("");
      setCompanyWebsite("");
      setCompanyEmail("");
      setCompanyPhone("");
      setClientName("");
      setClientAddress("");
      setInvoiceNumber("");
      setInvoiceTitle("");
      setDate(null);
      setDueDate(null);
      setNotes("");
      setCurrency("USD");
      setItems([{ description: "", quantity: 1, price: "", discount: 0 }]);
      setLogo("");
      setTaxRate(10);
      setDiscount(0);
      setPaymentMethod("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setRoutingNumber("");
      setTerms("");
      localStorage.removeItem("currentInvoice");
    }
  };

  // Logo upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleItemChange = (idx, field, value) => {
    setItems((items) =>
      items.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "discount"
                  ? Number(value)
                  : field === "price"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((items) => [
      ...items,
      { description: "", quantity: 1, price: "", discount: 0 },
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length > 1) {
      setItems((items) => items.filter((_, i) => i !== idx));
    }
  };

  // Drag and drop handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd + Enter (Mac) or Ctrl + Enter (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleGeneratePDF();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGeneratePDF]);

  // Sortable Section Component
  function SortableSection({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginBottom: "0px",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  }

  // Render section content based on ID
  const renderSection = (sectionId) => {
    const colors = getThemeColors();

    switch (sectionId) {
      case "header":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
            }}
          >
            {/* Company Logo/Name */}
            <div>
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                    maxWidth: "150px",
                    marginBottom: "6px",
                  }}
                />
              )}
              {activeFields.companyName && (
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    color: companyName ? colors.text : colors.textSecondary,
                    textTransform: "uppercase",
                  }}
                >
                  {companyName || "YOUR COMPANY"}
                </div>
              )}
            </div>

            {/* INVOICE label */}
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: colors.text,
                textTransform: "uppercase",
              }}
            >
              INVOICE
            </div>
          </div>
        );

      case "companyInfo":
        return (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            {/* Client Info */}
            <div
              style={{
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: "4px",
                  }}
                >
                  CLIENT NAME
                </div>
                {activeFields.clientName && clientName && (
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: colors.text,
                      marginBottom: "4px",
                    }}
                  >
                    {clientName}
                  </div>
                )}
                {activeFields.clientAddress && clientAddress && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: colors.textSecondary,
                      lineHeight: "1.5",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {clientAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice metadata - compact inline */}
            <div
              style={{
                marginBottom: "20px",
                fontSize: "11px",
                color: colors.textSecondary,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 20px",
              }}
            >
              {activeFields.date && (
                <div>
                  <strong style={{ color: colors.text }}>DATE:</strong>{" "}
                  {date ? format(date, "do MMM yyyy") : "[Date]"}
                </div>
              )}
              {activeFields.invoiceNumber && (
                <div>
                  <strong style={{ color: colors.text }}>INVOICE #:</strong>{" "}
                  {invoiceNumber || "[#]"}
                </div>
              )}
              {activeFields.dueDate && dueDate && (
                <div>
                  <strong style={{ color: colors.text }}>DUE:</strong>{" "}
                  {format(dueDate, "do MMM yyyy")}
                </div>
              )}
              {activeFields.invoiceTitle && invoiceTitle && (
                <div style={{ flexBasis: "100%", marginTop: "4px" }}>
                  <strong style={{ color: colors.text }}>RE:</strong>{" "}
                  {invoiceTitle}
                </div>
              )}
            </div>
          </div>
        );

      case "invoiceDetails":
        return (
          <div style={{ marginBottom: "16px" }}>
            {activeFields.notes && notes && (
              <div
                style={{
                  fontSize: "11px",
                  padding: "10px 12px",
                  color: colors.textSecondary,
                  backgroundColor: colors.cardBackground,
                  borderRadius: "3px",
                  border: `1px solid ${colors.border}`,
                  lineHeight: "1.5",
                }}
              >
                <strong
                  style={{
                    color: colors.text,
                    fontSize: "10px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  NOTES:
                </strong>
                {notes}
              </div>
            )}
          </div>
        );

      case "items":
        return (
          <div style={{ marginBottom: "20px" }}>
            <table
              style={{
                width: "100%",
                fontSize: "11px",
                borderCollapse: "collapse",
                marginBottom: "16px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th
                    style={{
                      padding: "8px 6px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "10px",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      padding: "8px 6px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "10px",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                      width: "60px",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      padding: "8px 6px",
                      textAlign: "right",
                      fontWeight: 600,
                      fontSize: "10px",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                      width: "80px",
                    }}
                  >
                    Price
                  </th>
                  {activeFields.discount && (
                    <th
                      style={{
                        padding: "8px 6px",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "10px",
                        color: colors.textSecondary,
                        textTransform: "uppercase",
                        width: "60px",
                      }}
                    >
                      Disc
                    </th>
                  )}
                  <th
                    style={{
                      padding: "8px 6px",
                      textAlign: "right",
                      fontWeight: 600,
                      fontSize: "10px",
                      color: colors.textSecondary,
                      textTransform: "uppercase",
                      width: "90px",
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemPrice = parseFloat(item.price) || 0;
                  const itemTotal = item.quantity * itemPrice;
                  const itemDiscount = activeFields.discount
                    ? itemTotal * (item.discount / 100)
                    : 0;
                  const itemFinal = itemTotal - itemDiscount;

                  return (
                    <tr
                      key={idx}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td
                        style={{
                          padding: "8px 6px",
                          color: colors.text,
                          fontSize: "11px",
                        }}
                      >
                        {item.description || "[Item Description]"}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          textAlign: "center",
                          color: colors.text,
                          fontSize: "11px",
                        }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: "8px 6px",
                          textAlign: "right",
                          color: colors.text,
                          fontSize: "11px",
                        }}
                      >
                        {currencySymbols[currency]}
                        {itemPrice.toFixed(2)}
                      </td>
                      {activeFields.discount && (
                        <td
                          style={{
                            padding: "8px 6px",
                            textAlign: "center",
                            color: colors.textSecondary,
                            fontSize: "11px",
                          }}
                        >
                          {item.discount.toFixed(2)}
                        </td>
                      )}
                      <td
                        style={{
                          padding: "8px 6px",
                          textAlign: "right",
                          color: colors.text,
                          fontSize: "11px",
                          fontWeight: 500,
                        }}
                      >
                        {currencySymbols[currency]}
                        {itemFinal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "totals":
        return (
          <div>
            {/* Totals Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px",
              }}
            >
              <div style={{ minWidth: "260px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    fontSize: "11px",
                    color: colors.textSecondary,
                  }}
                >
                  <span>SUB TOTAL:</span>
                  <span style={{ color: colors.text, fontWeight: 500 }}>
                    {currencySymbols[currency]}
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {activeFields.tax && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      fontSize: "11px",
                      color: colors.textSecondary,
                    }}
                  >
                    <span>TAX (GST {taxRate}%):</span>
                    <span style={{ color: colors.text, fontWeight: 500 }}>
                      {currencySymbols[currency]}
                      {tax.toFixed(2)}
                    </span>
                  </div>
                )}

                {activeFields.discount && totalDiscount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      fontSize: "11px",
                      color: colors.textSecondary,
                    }}
                  >
                    <span>DISCOUNT</span>
                    <span style={{ color: colors.text, fontWeight: 500 }}>
                      -{currencySymbols[currency]}
                      {totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: colors.text,
                    borderTop: `2px solid ${colors.border}`,
                    marginTop: "6px",
                  }}
                >
                  <span>BALANCE DUE ({currency}):</span>
                  <span>
                    {currencySymbols[currency]}
                    {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment and Terms Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                paddingTop: "16px",
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              {/* Payment Info */}
              {activeFields.payment && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      color: colors.text,
                      textTransform: "uppercase",
                    }}
                  >
                    PAYMENT
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: colors.textSecondary,
                      lineHeight: "1.5",
                    }}
                  >
                    {paymentMethod && (
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: 600,
                          color: colors.text,
                        }}
                      >
                        {paymentMethod}
                      </div>
                    )}
                    <div>
                      {bankName && (
                        <div style={{ marginBottom: "3px" }}>
                          <strong>BANK:</strong> {bankName}
                        </div>
                      )}
                      {accountName && (
                        <div style={{ marginBottom: "3px" }}>
                          <strong>NAME:</strong> {accountName}
                        </div>
                      )}
                      {accountNumber && (
                        <div style={{ marginBottom: "3px" }}>
                          <strong>ACC:</strong> {accountNumber}
                        </div>
                      )}
                      {routingNumber && (
                        <div style={{ marginBottom: "3px" }}>
                          <strong>BSB/IFSC:</strong> {routingNumber}
                        </div>
                      )}
                      {!bankName &&
                        !accountName &&
                        !accountNumber &&
                        !paymentMethod &&
                        !routingNumber && (
                          <div
                            style={{
                              color: colors.textSecondary,
                              fontStyle: "italic",
                            }}
                          >
                            [Add payment details]
                          </div>
                        )}
                    </div>
                    {activeFields.dueDate && dueDate && (
                      <div style={{ marginTop: "8px", fontWeight: 600 }}>
                        DUE: {format(dueDate, "MMM do, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {activeFields.terms && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      color: colors.text,
                      textTransform: "uppercase",
                    }}
                  >
                    TERMS & CONDITIONS
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: colors.textSecondary,
                      lineHeight: "1.4",
                    }}
                  >
                    {terms || "[Add terms and conditions]"}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Info */}
            {(activeFields.companyContact || activeFields.companyAddress) && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 16px",
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: `1px solid ${colors.border}`,
                  fontSize: "9px",
                  color: colors.textSecondary,
                }}
              >
                {activeFields.companyWebsite && companyWebsite && (
                  <div style={{ fontWeight: 600 }}>{companyWebsite}</div>
                )}
                {activeFields.companyEmail && companyEmail && (
                  <div style={{ fontWeight: 600 }}>{companyEmail}</div>
                )}
                {activeFields.companyPhone && companyPhone && (
                  <div style={{ fontWeight: 600 }}>{companyPhone}</div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Dotted grid background */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(128, 128, 128, 0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Header */}
      <div className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground"
              type="button"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Create Invoice
              </h1>
              <p className="text-xs text-muted-foreground">
                Fill in the details below
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PDF Theme Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPdfTheme("light")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                  pdfTheme === "light"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Light PDF"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">
                  Light
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPdfTheme("dark")}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                  pdfTheme === "dark"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dark PDF"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">
                  Dark
                </span>
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border"
              onClick={handleClearInvoice}
            >
              Clear
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleGeneratePDF}
            >
              <span>Generate PDF</span>
              <KbdGroup className="hidden sm:inline-flex ml-2">
                <Kbd className="bg-primary-foreground/20 text-primary-foreground border-0 text-[10px]">
                  ⌘
                </Kbd>
                <Kbd className="bg-primary-foreground/20 text-primary-foreground border-0 text-[10px]">
                  ↵
                </Kbd>
              </KbdGroup>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Field Customization - Simplified */}
              <Card className="border-border border-dashed">
                <CardContent className="p-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Customize Fields
                      </span>
                      <svg
                        className="w-4 h-4 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(optionalFields).map(
                        ([key, { label, icon: Icon }]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleField(key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              activeFields[key]
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}
                          >
                            <Icon className="w-3 h-3" strokeWidth={2} />
                            <span>{label}</span>
                          </button>
                        )
                      )}
                    </div>
                  </details>
                </CardContent>
              </Card>

              {/* Basic Info Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    {activeFields.logo && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Logo
                        </Label>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border file:text-sm file:font-medium file:bg-secondary file:text-foreground hover:file:bg-accent file:transition-all"
                          onChange={handleLogoUpload}
                        />
                        {logo && (
                          <div className="mt-2 flex items-center gap-2">
                            <img
                              src={logo}
                              alt="Logo preview"
                              className="h-12 w-auto object-contain rounded border border-border"
                            />
                            <button
                              type="button"
                              className="text-xs text-destructive underline hover:text-destructive/80 transition-colors"
                              onClick={() => setLogo("")}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeFields.companyName && (
                      <div>
                        <Label
                          htmlFor="company"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Company Name
                        </Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Your Company Inc."
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                    )}

                    {activeFields.companyAddress && (
                      <div>
                        <Label
                          htmlFor="company-address"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Company Address
                        </Label>
                        <Textarea
                          id="company-address"
                          placeholder="123 Business St, City, State ZIP"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}

                    {activeFields.clientName && (
                      <div>
                        <Label
                          htmlFor="client"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Client Name
                        </Label>
                        <Input
                          id="client"
                          type="text"
                          placeholder="Client Company or Name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      </div>
                    )}

                    {activeFields.clientAddress && (
                      <div>
                        <Label
                          htmlFor="client-address"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Client Address
                        </Label>
                        <Textarea
                          id="client-address"
                          placeholder="456 Client Ave, City, State ZIP"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Invoice Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {activeFields.invoiceNumber && (
                        <div>
                          <Label
                            htmlFor="invoice-number"
                            className="text-xs text-muted-foreground mb-2 block"
                          >
                            Invoice #
                          </Label>
                          <Input
                            id="invoice-number"
                            type="text"
                            placeholder="#001"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                          />
                        </div>
                      )}

                      {activeFields.currency && (
                        <div>
                          <Label
                            htmlFor="currency"
                            className="text-xs text-muted-foreground mb-2 block"
                          >
                            Currency
                          </Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="AUD">AUD (A$)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {activeFields.date && (
                        <div>
                          <Label
                            htmlFor="date"
                            className="text-xs text-muted-foreground mb-2 block"
                          >
                            Issue Date
                          </Label>
                          <DatePicker
                            date={date}
                            onDateChange={setDate}
                            placeholder="Select date"
                          />
                        </div>
                      )}

                      {activeFields.dueDate && (
                        <div>
                          <Label
                            htmlFor="due-date"
                            className="text-xs text-muted-foreground mb-2 block"
                          >
                            Due Date
                          </Label>
                          <DatePicker
                            date={dueDate}
                            onDateChange={setDueDate}
                            placeholder="Select due date"
                          />
                        </div>
                      )}
                    </div>

                    {activeFields.invoiceTitle && (
                      <div>
                        <Label
                          htmlFor="invoice-title"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Subject/Title
                        </Label>
                        <Input
                          id="invoice-title"
                          type="text"
                          placeholder="Project or service description"
                          value={invoiceTitle}
                          onChange={(e) => setInvoiceTitle(e.target.value)}
                        />
                      </div>
                    )}

                    {activeFields.notes && (
                      <div>
                        <Label
                          htmlFor="notes"
                          className="text-xs text-muted-foreground mb-2 block"
                        >
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional information..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Items Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Line Items
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      + Add Item
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-start p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex-1 space-y-3">
                          <Input
                            type="text"
                            className="text-sm"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "description",
                                e.target.value
                              )
                            }
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Quantity
                              </Label>
                              <Input
                                type="number"
                                className="text-sm"
                                min={1}
                                placeholder="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    idx,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Price
                              </Label>
                              <Input
                                type="number"
                                className="text-sm"
                                min={0}
                                step={0.01}
                                placeholder="0"
                                value={item.price}
                                onChange={(e) =>
                                  handleItemChange(idx, "price", e.target.value)
                                }
                              />
                            </div>
                            {activeFields.discount && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Discount %
                                </Label>
                                <Input
                                  type="number"
                                  className="text-sm"
                                  min={0}
                                  max={100}
                                  step={0.01}
                                  placeholder="0"
                                  value={item.discount}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "discount",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-destructive hover:text-destructive/80 p-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        {currencySymbols[currency]}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    {activeFields.tax && (
                      <div className="flex justify-between text-sm items-center gap-2">
                        <span className="text-muted-foreground">
                          Tax ({taxRate}%):
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-16 h-7 text-xs"
                            min={0}
                            max={100}
                            step={0.01}
                            value={taxRate}
                            onChange={(e) =>
                              setTaxRate(parseFloat(e.target.value) || 0)
                            }
                          />
                          <span className="font-medium">
                            {currencySymbols[currency]}
                            {tax.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    {activeFields.discount && totalDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium text-destructive">
                          -{currencySymbols[currency]}
                          {totalDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                      <span>Total:</span>
                      <span>
                        {currencySymbols[currency]}
                        {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Terms - Collapsible */}
              {(activeFields.payment || activeFields.terms) && (
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Additional Details
                    </h3>

                    {activeFields.payment && (
                      <div className="space-y-3 mb-4">
                        <Label className="text-xs text-muted-foreground">
                          Payment Information
                        </Label>
                        <Input
                          type="text"
                          placeholder="Payment method"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="text"
                            placeholder="Bank name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            type="text"
                            placeholder="Account name"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="text"
                            placeholder="Account number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            type="text"
                            placeholder="BSB/IFSC/Routing"
                            value={routingNumber}
                            onChange={(e) => setRoutingNumber(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {activeFields.terms && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">
                            Terms & Conditions
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTerms(standardTerms)}
                            className="h-6 text-xs"
                          >
                            Use Template
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Payment terms and conditions..."
                          value={terms}
                          onChange={(e) => setTerms(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Live Preview
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your invoice updates in real-time
                </p>
              </div>
              <div
                ref={previewRef}
                data-html2canvas-ignore-global-styles="true"
                style={{
                  backgroundColor: getThemeColors().background,
                  border: `1px solid ${getThemeColors().borderStrong}`,
                  borderRadius: "8px",
                  padding: "32px",
                  position: "relative",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  color: getThemeColors().text,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  maxHeight: "800px",
                  overflowY: "auto",
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sectionOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {sectionOrder.map((sectionId) => (
                      <SortableSection key={sectionId} id={sectionId}>
                        {renderSection(sectionId)}
                      </SortableSection>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
