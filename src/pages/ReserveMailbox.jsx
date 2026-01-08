
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, CheckCircle, CreditCard, AlertCircle, User, Briefcase, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ReserveMailbox() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: checking, true: authenticated, false: not authenticated
  const [user, setUser] = useState(null); // Stores authenticated user data
  const [step, setStep] = useState(1);
  const [mailboxUseType, setMailboxUseType] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "", // New: Middle initial for USPS Form
    email: "",
    phone: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States", // New: Country for USPS Form, default to US
    is_business_mail: false,
    how_heard: "",
    referral_detail: "",
    id_submission_method: "", // New: 'upload' or 'bring_later'
  });
  
  const [idDocuments, setIdDocuments] = useState({ // New state for ID file objects
    primary_id: null,
    secondary_id: null,
  });
  const [uploadingIds, setUploadingIds] = useState(false); // New state for ID upload loading

  // New USPS Form 1583 specific data
  const [uspsFormData, setUspsFormData] = useState({
    photo_id_type: "",
    photo_id_number: "",
    photo_id_issuing_entity: "",
    photo_id_expiration: "",
    address_id_type: "",
    additional_recipients: "",
    business_name: "",
    business_type: "",
    business_street: "",
    business_city: "",
    business_state: "",
    business_zip: "",
    business_country: "United States",
    business_phone: "",
    business_registration_place: ""
  });

  const [addMailboxKey, setAddMailboxKey] = useState(false);
  const [personalMailbox, setPersonalMailbox] = useState({ size: '', duration: '' });
  const [businessMailbox, setBusinessMailbox] = useState({ size: '', duration: '' });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0); // For non-promotion specific coupons
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [validationDialog, setValidationDialog] = useState(null);

  const TAX_RATE = 0.0825;

  // Check if promotion is active (until midnight Jan 1, 2026 Central Time)
  const isPromotionActive = () => {
    const now = new Date();
    const promoEndDate = new Date('2026-01-01T06:00:00Z'); // 12:00 AM Central = 6:00 AM UTC
    return now < promoEndDate;
  };

  const pricing = {
    key: 6,
    personal: {
      small: { '3': 60, '6': 120, '12': 240, '18': 360, '24': 480 },
      medium: { '3': 75, '6': 150, '12': 300, '18': 450, '24': 600 },
      large: { '3': 90, '6': 180, '12': 360, '18': 540, '24': 720 }
    },
    business: {
      medium: { '3': 75, '6': 150, '12': 300, '18': 450, '24': 600 },
      large: { '3': 90, '6': 180, '12': 360, '18': 540, '24': 720 }
    }
  };

  // Get actual price (with promo if applicable)
  const getActualPrice = (basePrice, months) => {
    if (isPromotionActive() && parseInt(months) >= 12) {
      return basePrice * 0.5;
    }
    return basePrice;
  };

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
          
          // Auto-populate form from user data
          const nameParts = (userData.full_name || '').split(' ');
          setFormData(prevData => ({
            ...prevData,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: userData.email || '',
            phone: userData.phone || '',
            street1: userData.street_address || '',
            street2: userData.street_address_2 || '',
            city: userData.city || '',
            state: userData.state || '',
            zip: userData.zip_code || '',
            // is_business_mail, how_heard, referral_detail will remain at their initial states
            // or be set by user input. id_submission_method will also remain blank initially.
          }));
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false); // Treat any error as unauthenticated
      }
    };
    checkAuth();
  }, []); // Run once on component mount

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Free Account</h2>
            <p className="text-gray-600 mb-6">Sign up or log in to reserve your mailbox and save your information for faster checkout.</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-blue-900 hover:bg-blue-800"
            >
              Create Free Account / Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateTotals = () => {
    let subtotal = 0;
    
    if (addMailboxKey) subtotal += pricing.key;
    
    // Only add personal mailbox if it's selected and not 'both'
    if (mailboxUseType === 'personal' && personalMailbox.size && personalMailbox.duration) {
      subtotal += getPersonalPrice();
    }
    
    // Always add business mailbox if it's selected or if 'both' is selected
    if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size && businessMailbox.duration) {
      subtotal += getBusinessPrice();
    }
    
    let discountAmount = 0;
    // Example for other coupons (not the 50% off promo, which is applied directly to item price)
    // if (couponCode.toLowerCase() === 'firstmonthfree') {
    //   discountAmount = ... calculate based on first month's price ...
    // }
    discountAmount += couponDiscount; // Add any dynamically set coupon discount

    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;
    
    return { subtotal, discount: discountAmount, tax, total };
  };

  const getProgress = () => {
    return (step / 5) * 100; // Changed from /4 to /5
  };

  const progress = getProgress();

  const getPersonalPrice = () => {
    if (personalMailbox.size && personalMailbox.duration) {
      const basePrice = pricing.personal[personalMailbox.size][personalMailbox.duration] || 0;
      return getActualPrice(basePrice, personalMailbox.duration);
    }
    return 0;
  };

  const getBusinessPrice = () => {
    if (businessMailbox.size && businessMailbox.duration) {
      const basePrice = pricing.business[businessMailbox.size][businessMailbox.duration] || 0;
      return getActualPrice(basePrice, businessMailbox.duration);
    }
    return 0;
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!mailboxUseType) {
        alert("Please select how you'll use the mailbox");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || 
          !formData.street1 || !formData.city || !formData.state || !formData.zip || !formData.how_heard) {
        alert("Please complete all required fields");
        return false;
      }
      // New validation for ID submission method
      if (!formData.id_submission_method) {
        alert("Please select how you will provide your ID documents.");
        return false;
      }
      if (formData.id_submission_method === 'upload') {
        if (!idDocuments.primary_id || !idDocuments.secondary_id) {
          alert("Please upload both your primary and secondary ID documents.");
          return false;
        }
      }
    }
    if (currentStep === 3) {
      let isMailboxSelected = false;
      if (mailboxUseType === 'personal' && personalMailbox.size && personalMailbox.duration) {
        isMailboxSelected = true;
      }
      if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size && businessMailbox.duration) {
        isMailboxSelected = true;
      }
      if (!isMailboxSelected) {
        alert("Please select a mailbox size and duration.");
        return false;
      }
    }
    if (currentStep === 4) { // New step 4 validation for USPS Form 1583
      // Photo ID validation
      if (!uspsFormData.photo_id_type || !uspsFormData.photo_id_number || 
          !uspsFormData.photo_id_issuing_entity) {
        alert("Please complete all required Photo ID fields for USPS Form 1583.");
        return false;
      }
      // Address ID validation
      if (!uspsFormData.address_id_type) {
        alert("Please select an Address ID Type for USPS Form 1583.");
        return false;
      }
      
      // If business, validate business fields
      if (mailboxUseType === 'business' || mailboxUseType === 'both') {
        if (!uspsFormData.business_name || !uspsFormData.business_type) {
          alert("Please complete all required Business Information fields for USPS Form 1583.");
          return false;
        }
      }
    }
    return true;
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createReservation = async () => { // Removed idUploadNotes, uspsNotes parameters
    console.log("=== CREATE RESERVATION START ===");
    console.log("Current reservationId state:", reservationId);
    
    // Reconstruct the notes based on current formData for Step 2.
    // The details about uploaded file URLs are handled by email in handleNext.
    const step2Notes = `How heard: ${formData.how_heard}${formData.referral_detail ? ` (${formData.referral_detail})` : ''}\nAddress validated: Yes\nID Submission Method: ${formData.id_submission_method === 'upload' ? 'Documents Uploaded' : 'Will bring to store'}`;
    
    const reservationDataToSend = {
      id: reservationId, // If reservationId exists, it's an update
      customer_name: `${formData.first_name} ${formData.last_name}`,
      email: formData.email,
      phone: formData.phone,
      street_address: formData.street1,
      street_address_2: formData.street2,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip,
      business_name: uspsFormData.business_name || "", // Use USPS business name
      mailbox_type: mailboxUseType === 'both' ? 'business' : mailboxUseType, // If 'both', consider it a business mailbox in the backend
      notes: step2Notes, // Always send the complete notes for this stage
      status: 'pending',
      payment_status: 'pending',
      preferred_size: "medium", // Default, will be updated in handleSubmit or subsequent steps
      start_date: new Date().toISOString().split('T')[0],
      additional_services: []
    };

    console.log("Sending reservation_data:", JSON.stringify(reservationDataToSend, null, 2));

    const createResponse = await base44.functions.invoke('createUserAndReservation', {
      reservation_data: reservationDataToSend
    });

    console.log("Backend response:", createResponse.data);

    if (createResponse.data.success) {
      const newReservationId = createResponse.data.reservation_id;
      console.log("Setting reservation ID to:", newReservationId);
      setReservationId(newReservationId);
      console.log("Reservation saved successfully, ID:", newReservationId);
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log("After short delay, reservationId should be:", newReservationId);
    } else {
      console.error("Backend returned failure:", createResponse.data.error);
      throw new Error(createResponse.data.error || "Failed to create reservation");
    }
    console.log("=== CREATE RESERVATION END ===");
  };

  const applyValidatedAddress = async () => {
    if (validationDialog?.validated) {
      setFormData({
        ...formData,
        street1: validationDialog.validated.street1,
        street2: validationDialog.validated.street2 || formData.street2,
        city: validationDialog.validated.city,
        state: validationDialog.validated.state,
        zip: validationDialog.validated.zip
      });
      
      // Remove idUploadNotes from validationDialog and its usage
      setValidationDialog(null); // Clear dialog state
      
      // Now create reservation with corrected address
      setValidatingAddress(true);
      try {
        await createReservation(); // No idUploadNotes parameter needed
        setValidatingAddress(false);
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Error creating reservation:", error);
        alert(`There was an error: ${error.message}`);
        setValidatingAddress(false);
      }
    }
  };
  // ======== 1583 Admin Email Export (no UI to the customer) ========
  const csvEscape = (val = "") => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const build1583Row = ({ pmbLabel }) => {
    // Map exactly what you collect today; extend later if you add DOB, etc.
    return {
      pmb: pmbLabel || "PMB_pending",
      app_first: formData.first_name || "",
      app_middle: formData.middle_initial || "",
      app_last: formData.last_name || "",
      app_dob: "", // not collected yet
      photo_id_type: uspsFormData.photo_id_type || "",
      photo_id_number: uspsFormData.photo_id_number || "",
      photo_id_exp: uspsFormData.photo_id_expiration || "",
      photo_id_issuing_entity: uspsFormData.photo_id_issuing_entity || "",
      addr_id_type: uspsFormData.address_id_type || "",
      addr_line: formData.street1 || "",
      addr_city: formData.city || "",
      addr_state: formData.state || "",
      addr_zip: formData.zip || "",
      addr_country: "US",
      mailbox_use_type: mailboxUseType || "",
      business_name: uspsFormData.business_name || "",
      business_type: uspsFormData.business_type || "",
      business_phone: uspsFormData.business_phone || "",
      business_addr: [uspsFormData.business_street, uspsFormData.business_city, uspsFormData.business_state, uspsFormData.business_zip].filter(Boolean).join(", "),
      additional_recipients: uspsFormData.additional_recipients || "",
      exported_at: new Date().toISOString(),
      reservation_id: String(reservationId || "")
    };
  };

  const buildCsvBlob = (row) => {
    const headers = [
      "pmb","reservation_id",
      "app_first","app_middle","app_last","app_dob",
      "photo_id_type","photo_id_number","photo_id_exp","photo_id_issuing_entity",
      "addr_id_type","addr_line","addr_city","addr_state","addr_zip","addr_country",
      "mailbox_use_type",
      "business_name","business_type","business_phone","business_addr",
      "additional_recipients",
      "exported_at"
    ];
    const csv = [
      headers.join(","),
      headers.map(h => csvEscape(row[h])).join(",")
    ].join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8" });
  };

  const loadJsPDF = () =>
    new Promise((resolve, reject) => {
      if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("jsPDF not available"));
      s.onerror = () => reject(new Error("Failed to load jsPDF"));
      document.head.appendChild(s);
    });

  const buildPdfBlob = async (row) => {
    const JS = await loadJsPDF();
    const doc = new JS({ unit: "pt", format: "letter" });
    const L = 54, R = 558;
    let y = 64, lh = 18;

    const add = (label, value="") => {
      doc.setFontSize(10);
      doc.setFont("helvetica","bold"); doc.text(label, L, y);
      doc.setFont("helvetica","normal"); doc.text(String(value || ""), L+160, y, { maxWidth: (R-L-160) });
      y += lh;
    };

    doc.setFont("helvetica","bold"); doc.setFontSize(14);
    doc.text(`${row.pmb} — USPS Form 1583 Summary`, L, y); y += 24;

    add("Exported at", row.exported_at);
    add("Reservation ID", row.reservation_id || "—");
    y += 6; doc.setDrawColor(180); doc.line(L,y,R,y); y += 16;

    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("Applicant & Photo ID (Section 8)", L, y); y += 16;
    add("Last Name", row.app_last);
    add("First Name", row.app_first);
    add("Middle Init", row.app_middle || "—");
    add("DOB", row.app_dob || "—");
    add("Photo ID Type", row.photo_id_type || "—");
    add("Photo ID Number", row.photo_id_number || "—");
    add("Photo ID Expiration", row.photo_id_exp || "—");
    add("Issuing Entity", row.photo_id_issuing_entity || "—");

    y += 6; doc.setDrawColor(180); doc.line(L,y,R,y); y += 16;
    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("Address & Address ID (Section 9)", L, y); y += 16;
    add("Address ID Type", row.addr_id_type || "—");
    add("Address Line", row.addr_line || "—");
    add("City / State / ZIP", [row.addr_city, row.addr_state, row.addr_zip].filter(Boolean).join(", ") || "—");
    add("Country", row.addr_country || "—");

    if (row.mailbox_use_type === "business" || row.mailbox_use_type === "both") {
      y += 6; doc.setDrawColor(180); doc.line(L,y,R,y); y += 16;
      doc.setFont("helvetica","bold"); doc.setFontSize(12);
      doc.text("Business / Organization (Section 7)", L, y); y += 16;
      add("Business Name", row.business_name || "—");
      add("Business Type", row.business_type || "—");
      add("Business Phone", row.business_phone || "—");
      add("Business Address", row.business_addr || "—");
    }

    if (row.additional_recipients) {
      y += 6; doc.setDrawColor(180); doc.line(L,y,R,y); y += 16;
      doc.setFont("helvetica","bold"); doc.setFontSize(12);
      doc.text("Additional Recipients (Section 12)", L, y); y += 16;
      add("Names", row.additional_recipients);
    }

    // Return as Blob (no download)
    const arrayBuf = doc.output("arraybuffer");
    return new Blob([arrayBuf], { type: "application/pdf" });
  };

  const uploadFile = async (blob, filename) => {
    const file = new File([blob], filename, { type: blob.type });
    const res = await base44.integrations.Core.UploadFile({ file });
    // Expecting { file_url }
    if (!res || !res.file_url) throw new Error("Upload failed");
    return res.file_url;
  };

  const emailAdminArtifacts = async ({ csvUrl, pdfUrl, pmbLabel }) => {
    const body = `
New 1583 artifacts generated from ReserveMailbox (Step 4).

PMB / Label: ${pmbLabel}
Reservation ID: ${reservationId || "—"}

CSV: ${csvUrl}
PDF: ${pdfUrl || "PDF generation skipped (CSP) — see CSV"}

Applicant:
- ${formData.first_name} ${formData.middle_initial ? formData.middle_initial + " " : ""}${formData.last_name}
- ${formData.email} | ${formData.phone}

Address:
- ${formData.street1}${formData.street2 ? ", " + formData.street2 : ""}
- ${formData.city}, ${formData.state} ${formData.zip}

USPS 1583:
- Photo ID: ${uspsFormData.photo_id_type || "—"} / ${uspsFormData.photo_id_number || "—"} / ${uspsFormData.photo_id_issuing_entity || "—"} / ${uspsFormData.photo_id_expiration || "—"}
- Address ID: ${uspsFormData.address_id_type || "—"}
- Addl Recipients: ${uspsFormData.additional_recipients || "None"}

Business (if provided):
- Name: ${uspsFormData.business_name || "—"}
- Type: ${uspsFormData.business_type || "—"}
- Phone: ${uspsFormData.business_phone || "—"}
- Address: ${[uspsFormData.business_street, uspsFormData.business_city, uspsFormData.business_state, uspsFormData.business_zip].filter(Boolean).join(", ") || "—"}

Generated at: ${new Date().toLocaleString()}
    `;
    await base44.integrations.Core.SendEmail({
      to: "contact@themonarchmail.com",
      subject: `Monarch Mail — 1583 CSV/PDF for ${formData.first_name} ${formData.last_name} (${pmbLabel})`,
      body
    });
  };

  // Main orchestrator: create, upload, email (no UI shown to customer)
  const send1583ArtifactsToAdmin = async () => {
    // If you don’t yet know the PMB here, label with reservation; you can rename later after assignment.
    const pmbLabel = reservationId ? `PMB_${reservationId}` : "PMB_pending";

    const row = build1583Row({ pmbLabel });
    const csvBlob = buildCsvBlob(row);
    const csvUrl = await uploadFile(csvBlob, `${pmbLabel}_1583_data.csv`);

    let pdfUrl = "";
    try {
      const pdfBlob = await buildPdfBlob(row);
      pdfUrl = (await uploadFile(pdfBlob, `${pmbLabel}_1583_summary.pdf`)) || "";
    } catch (e) {
      console.warn("PDF build/upload skipped:", e?.message || e);
      // Keep going: CSV already uploaded
    }

    await emailAdminArtifacts({ csvUrl, pdfUrl, pmbLabel });
  };

  const continueWithOriginalAddress = async () => {
    // Remove idUploadNotes from validationDialog and its usage
    setValidationDialog(null); // Clear dialog state

    setValidatingAddress(true);
    try {
      await createReservation(); // No idUploadNotes parameter needed
      setValidatingAddress(false);
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert(`There was an error: ${error.message}`);
      setValidatingAddress(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    // Special handling for step 2 -> step 3: Upload IDs if needed, validate address, and save reservation
    if (step === 2) {
      setValidatingAddress(true);
      
      // Removed currentIdUploadNotes variable, as the file URLs are sent in email,
      // and the reservation notes will only state the *method* of ID submission.

      try {
        // Step 1: Upload ID documents if user chose to upload
        if (formData.id_submission_method === 'upload') {
          setUploadingIds(true);
          console.log("Uploading ID documents...");
          
          let primaryUploadResult;
          try {
              primaryUploadResult = await base44.integrations.Core.UploadFile({ file: idDocuments.primary_id });
          } catch (uploadError) {
              console.error("Error uploading primary ID:", uploadError);
              throw new Error("Failed to upload primary ID document. Please try again.");
          }

          let secondaryUploadResult;
          try {
              secondaryUploadResult = await base44.integrations.Core.UploadFile({ file: idDocuments.secondary_id });
          } catch (uploadError) {
              console.error("Error uploading secondary ID:", uploadError);
              throw new Error("Failed to upload secondary ID document. Please try again.");
          }
          
          console.log("IDs uploaded successfully");
          
          // The file URLs are sent via email for admin to review
          await base44.integrations.Core.SendEmail({
            to: "contact@themonarchmail.com",
            subject: `ID Documents for New Mailbox Application - ${formData.first_name} ${formData.last_name}`,
            body: `
New mailbox application with ID documents uploaded.

Customer: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Phone: ${formData.phone}

Primary ID URL: ${primaryUploadResult.file_url}
Secondary ID URL: ${secondaryUploadResult.file_url}

Please review these documents for the mailbox application.
            `
          });
          
          // Removed setting currentIdUploadNotes as it's not carried forward in state/reservation.notes
          setUploadingIds(false);
        } else if (formData.id_submission_method === 'bring_later') {
          // No specific action needed here for notes, as createReservation will derive it from formData.id_submission_method
        }

        // Step 2: Validate address using Shippo
        console.log("Validating address...");
        const addressValidation = await base44.functions.invoke('validateAddress', {
          address: {
            name: `${formData.first_name} ${formData.last_name}`,
            street1: formData.street1,
            street2: formData.street2 || "",
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: "US"
          }
        });

        console.log("Validation response:", addressValidation.data);

        const hasValidatedSuggestion = !!addressValidation.data.validated;
        const addressesMatch = (original, validated) => {
          if (!validated) return true;
          
          const normalize = (str) => String(str).toLowerCase().trim();

          return (
            normalize(original.street1) === normalize(validated.street1) &&
            normalize(original.city) === normalize(validated.city) &&
            normalize(original.state) === normalize(validated.state) &&
            normalize(original.zip) === normalize(validated.zip)
          );
        };

        const needsCorrection = hasValidatedSuggestion && 
          !addressesMatch(
            { street1: formData.street1, city: formData.city, state: formData.state, zip: formData.zip },
            addressValidation.data.validated
          );

        const hasErrors = !addressValidation.data.is_valid ||
          (addressValidation.data.messages && addressValidation.data.messages.length > 0);

        if (needsCorrection || hasErrors) {
          setValidationDialog({
            original: {
              street1: formData.street1,
              street2: formData.street2,
              city: formData.city,
              state: formData.state,
              zip: formData.zip
            },
            validated: addressValidation.data.validated,
            messages: addressValidation.data.messages,
            is_valid: addressValidation.data.is_valid,
            // Removed idUploadNotes from here as it's not passed to createReservation
          });
          setValidatingAddress(false);
          return;
        }

        await createReservation(); // No currentIdUploadNotes parameter
        setValidatingAddress(false);
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error("Error in step 2->3 transition:", error);
        alert(`There was an error: ${error.message}. Please try again or call (210) 265-5805 for assistance.`);
        setValidatingAddress(false);
        setUploadingIds(false);
      }
    } else if (step === 3) {
      console.log("=== STEP 3 -> 4 TRANSITION START ===");
      console.log("Current reservationId:", reservationId);
      
      try {
        if (!reservationId) {
          console.error("❌ NO RESERVATION ID FOUND in step 3 transition.");
          alert("Reservation not found. Please go back to step 2 and try again.");
          setStep(2);
          return;
        }

        console.log("✓ Reservation ID found:", reservationId);
        console.log("Mailbox use type:", mailboxUseType);
        console.log("Personal mailbox selection:", personalMailbox);
        console.log("Business mailbox selection:", businessMailbox);

        const selectedProducts = [];
        if (addMailboxKey) selectedProducts.push({ id: 'key', name: 'Mailbox Key', price: pricing.key });
        
        if (mailboxUseType === 'personal' && personalMailbox.size && personalMailbox.duration) {
          const basePrice = pricing.personal[personalMailbox.size][personalMailbox.duration];
          const actualPrice = getActualPrice(basePrice, personalMailbox.duration);
          selectedProducts.push({ 
            id: `${personalMailbox.size}_${personalMailbox.duration}mo_p`, 
            name: `${personalMailbox.size.charAt(0).toUpperCase() + personalMailbox.size.slice(1)} Mailbox (Personal)`,
            price: actualPrice,
            duration: `${personalMailbox.duration} months`
          });
        }
        
        if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size && businessMailbox.duration) {
          const basePrice = pricing.business[businessMailbox.size][businessMailbox.duration];
          const actualPrice = getActualPrice(basePrice, businessMailbox.duration);
          selectedProducts.push({ 
            id: `${businessMailbox.size}_${businessMailbox.duration}mo_b`, 
            name: `${businessMailbox.size.charAt(0).toUpperCase() + businessMailbox.size.slice(1)} Mailbox (Business)`,
            price: actualPrice,
            duration: `${businessMailbox.duration} months`
          });
        }

        console.log("Selected products for update:", selectedProducts);

        let preferredSize = "medium";
        if (mailboxUseType === 'personal' && personalMailbox.size) {
          preferredSize = personalMailbox.size;
        } else if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size) {
          preferredSize = businessMailbox.size;
        }
        console.log("Preferred size:", preferredSize);

        // Reconstruct complete notes from scratch for this step
        const completeNotes = `How heard: ${formData.how_heard}${formData.referral_detail ? ` (${formData.referral_detail})` : ''}\nAddress validated: Yes\nID Submission Method: ${formData.id_submission_method === 'upload' ? 'Documents Uploaded' : 'Will bring to store'}\nSelected products: ${selectedProducts.map(p => `${p.name} ${p.duration || ''}`).join(', ')}`;

        const updateData = {
          id: reservationId,
          customer_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          phone: formData.phone,
          street_address: formData.street1,
          street_address_2: formData.street2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
          business_name: uspsFormData.business_name || "",
          mailbox_type: mailboxUseType === 'both' ? 'business' : mailboxUseType,
          preferred_size: preferredSize,
          notes: completeNotes, // Overwrite with the comprehensive notes for this stage
          status: 'pending',
          payment_status: 'pending',
          start_date: new Date().toISOString().split('T')[0],
          additional_services: []
        };
        console.log("Sending update with data:", JSON.stringify(updateData, null, 2));

        const updateResponse = await base44.functions.invoke('createUserAndReservation', {
          reservation_data: updateData
        });

        console.log("Update response:", updateResponse.data);

        if (!updateResponse.data.success) {
          console.error("❌ Update failed for step 3:", updateResponse.data.error);
          throw new Error(updateResponse.data.error || "Failed to update reservation");
        }

        console.log("✓ Reservation updated successfully for step 3.");
        console.log("=== STEP 3 -> 4 TRANSITION END ===");
        
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("=== ERROR IN STEP 3 -> 4 TRANSITION ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        alert(`There was an error saving mailbox details: ${error.message}. Please try again or call (210) 265-5805.`);
      }
    } else if (step === 4) {
      console.log("=== STEP 4 -> 5 TRANSITION START ===");
      console.log("Current reservationId:", reservationId);
      
      try {
        if (!reservationId) {
          console.error("❌ NO RESERVATION ID FOUND in step 4 transition.");
          alert("Reservation not found. Please go back to step 2 and try again.");
          setStep(2);
          return;
        }

        console.log("✓ Reservation ID found:", reservationId);
        console.log("USPS Form Data captured:", uspsFormData);

        // Reconstruct complete notes from scratch for this step, including USPS data
        const selectedProducts = [];
        if (addMailboxKey) selectedProducts.push({ id: 'key', name: 'Mailbox Key', price: pricing.key });
        
        if (mailboxUseType === 'personal' && personalMailbox.size && personalMailbox.duration) {
          const basePrice = pricing.personal[personalMailbox.size][personalMailbox.duration];
          const actualPrice = getActualPrice(basePrice, personalMailbox.duration);
          selectedProducts.push({ 
            id: `${personalMailbox.size}_${personalMailbox.duration}mo_p`, 
            name: `${personalMailbox.size.charAt(0).toUpperCase() + personalMailbox.size.slice(1)} Mailbox (Personal)`,
            price: actualPrice,
            duration: `${personalMailbox.duration} months`
          });
        }
        
        if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size && businessMailbox.duration) {
          const basePrice = pricing.business[businessMailbox.size][businessMailbox.duration];
          const actualPrice = getActualPrice(basePrice, businessMailbox.duration);
          selectedProducts.push({ 
            id: `${businessMailbox.size}_${businessMailbox.duration}mo_b`, 
            name: `${businessMailbox.size.charAt(0).toUpperCase() + businessMailbox.size.slice(1)} Mailbox (Business)`,
            price: actualPrice,
            duration: `${businessMailbox.duration} months`
          });
        }

        const uspsFormDetails = `\n--- USPS Form 1583 Details ---\n` +
          `Photo ID Type: ${uspsFormData.photo_id_type || 'N/A'}\n` +
          `Photo ID Number: ${uspsFormData.photo_id_number || 'N/A'}\n` +
          `Photo ID Issuing Entity: ${uspsFormData.photo_id_issuing_entity || 'N/A'}\n` +
          `Photo ID Expiration: ${uspsFormData.photo_id_expiration || 'N/A'}\n` +
          `Address ID Type: ${uspsFormData.address_id_type || 'N/A'}\n` +
          `Additional Recipients: ${uspsFormData.additional_recipients || 'None'}\n` +
          (mailboxUseType === 'business' || mailboxUseType === 'both' ? 
            `Business Name: ${uspsFormData.business_name || 'N/A'}\n` +
            `Business Type: ${uspsFormData.business_type || 'N/A'}\n` +
            `Business Phone: ${uspsFormData.business_phone || 'N/A'}\n` +
            `Business Address: ${uspsFormData.business_street || 'N/A'}, ${uspsFormData.business_city || 'N/A'}, ${uspsFormData.business_state || 'N/A'} ${uspsFormData.business_zip || 'N/A'}\n` +
            `Business Registration Place: ${uspsFormData.business_registration_place || 'N/A'}\n`
            : '') +
          `--- End USPS Form 1583 Details ---`;
          
        const completeNotes = `How heard: ${formData.how_heard}${formData.referral_detail ? ` (${formData.referral_detail})` : ''}\nAddress validated: Yes\nID Submission Method: ${formData.id_submission_method === 'upload' ? 'Documents Uploaded' : 'Will bring to store'}\nSelected products: ${selectedProducts.map(p => `${p.name} ${p.duration || ''}`).join(', ')}${uspsFormDetails}`;


        let preferredSize = "medium";
        if (mailboxUseType === 'personal' && personalMailbox.size) {
          preferredSize = personalMailbox.size;
        } else if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size) {
          preferredSize = businessMailbox.size;
        }

        const updateData = {
          id: reservationId,
          customer_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          phone: formData.phone,
          street_address: formData.street1,
          street_address_2: formData.street2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
          business_name: uspsFormData.business_name || "",
          mailbox_type: mailboxUseType === 'both' ? 'business' : mailboxUseType,
          preferred_size: preferredSize,
          notes: completeNotes, // Overwrite with the comprehensive notes for this stage
          status: 'pending',
          payment_status: 'pending',
          start_date: new Date().toISOString().split('T')[0],
          additional_services: []
        };
        console.log("Sending update with data:", JSON.stringify(updateData, null, 2));

        const updateResponse = await base44.functions.invoke('createUserAndReservation', {
          reservation_data: updateData
        });

        console.log("Update response:", updateResponse.data);

        if (!updateResponse.data.success) {
          console.error("❌ Update failed for step 4:", updateResponse.data.error);
          throw new Error(updateResponse.data.error || "Failed to update reservation");
        }

        console.log("✓ USPS form data saved successfully for step 4.");
        console.log("=== STEP 4 -> 5 TRANSITION END ===");
        
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("=== ERROR IN STEP 4 -> 5 TRANSITION ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        alert(`There was an error saving USPS form details: ${error.message}. Please try again.`);
      }
    } else {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const applyCoupon = () => {
    // This is where you would validate and apply other coupons, setting couponDiscount state
    // For now, it's just a placeholder for potential future coupons.
    if (couponCode.toLowerCase() === 'testdiscount') { // Example for a custom coupon
      setCouponDiscount(10); // Apply a $10 discount
      alert("Test discount applied!");
    } else {
      setCouponDiscount(0);
      alert("Invalid coupon code.");
    }
    // Recalculate totals to reflect the coupon change (implicitly done by re-render)
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();
      
      const selectedProducts = [];
      if (addMailboxKey) selectedProducts.push({ id: 'key', name: 'Mailbox Key', price: pricing.key });
      
      if (mailboxUseType === 'personal' && personalMailbox.size && personalMailbox.duration) {
        const basePrice = pricing.personal[personalMailbox.size][personalMailbox.duration];
        const actualPrice = getActualPrice(basePrice, personalMailbox.duration);
        selectedProducts.push({ 
          id: `${personalMailbox.size}_${personalMailbox.duration}mo_p`, 
          name: `${personalMailbox.size.charAt(0).toUpperCase() + personalMailbox.size.slice(1)} Mailbox (Personal)`,
          price: actualPrice, // Use actual (possibly discounted) price
          duration: `${personalMailbox.duration} months`
        });
      }
      
      if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size && businessMailbox.duration) {
        const basePrice = pricing.business[businessMailbox.size][businessMailbox.duration];
        const actualPrice = getActualPrice(basePrice, businessMailbox.duration);
        selectedProducts.push({ 
          id: `${businessMailbox.size}_${businessMailbox.duration}mo_b`, 
          name: `${businessMailbox.size.charAt(0).toUpperCase() + businessMailbox.size.slice(1)} Mailbox (Business)`,
          price: actualPrice, // Use actual (possibly discounted) price
          duration: `${businessMailbox.duration} months`
        });
      }

      // Determine preferred size based on selected mailboxes
      let preferredSize = "medium"; // Default
      if (mailboxUseType === 'personal' && personalMailbox.size) {
        preferredSize = personalMailbox.size;
      } else if ((mailboxUseType === 'business' || mailboxUseType === 'both') && businessMailbox.size) {
        preferredSize = businessMailbox.size;
      }

      const uspsFormDetails = `\n--- USPS Form 1583 Details ---\n` +
          `Photo ID Type: ${uspsFormData.photo_id_type || 'N/A'}\n` +
          `Photo ID Number: ${uspsFormData.photo_id_number || 'N/A'}\n` +
          `Photo ID Issuing Entity: ${uspsFormData.photo_id_issuing_entity || 'N/A'}\n` +
          `Photo ID Expiration: ${uspsFormData.photo_id_expiration || 'N/A'}\n` +
          `Address ID Type: ${uspsFormData.address_id_type || 'N/A'}\n` +
          `Additional Recipients: ${uspsFormData.additional_recipients || 'None'}\n` +
          (mailboxUseType === 'business' || mailboxUseType === 'both' ? 
            `Business Name: ${uspsFormData.business_name || 'N/A'}\n` +
            `Business Type: ${uspsFormData.business_type || 'N/A'}\n` +
            `Business Phone: ${uspsFormData.business_phone || 'N/A'}\n` +
            `Business Address: ${uspsFormData.business_street || 'N/A'}, ${uspsFormData.business_city || 'N/A'}, ${uspsFormData.business_state || 'N/A'} ${uspsFormData.business_zip || 'N/A'}\n` +
            `Business Registration Place: ${uspsFormData.business_registration_place || 'N/A'}\n`
            : '') +
          `--- End USPS Form 1583 Details ---`;
      
      // Construct a comprehensive notes string for the final update from scratch
      const finalNotes = `
Mailbox Type: ${mailboxUseType}
Selected Products:
${selectedProducts.map(p => `- ${p.name} ${p.duration || ''}`).join('\n')}

How Heard: ${formData.how_heard}${formData.referral_detail ? ` (${formData.referral_detail})` : ''}
ID Submission: ${formData.id_submission_method === 'upload' ? 'Documents Uploaded' : 'Will bring to store'}
Mailbox Key: ${addMailboxKey ? 'Yes' : 'No'}
Coupon Code: ${couponCode || 'None'}
${uspsFormDetails}
Subtotal: $${totals.subtotal.toFixed(2)}
Discount: $${totals.discount.toFixed(2)}
Tax: $${totals.tax.toFixed(2)}
Total: $${totals.total.toFixed(2)}
      `;

      // Update the existing reservation with final details
      // Use the same createUserAndReservation function for consistency
      const updateResponse = await base44.functions.invoke('createUserAndReservation', {
        reservation_data: {
          id: reservationId, // Must provide ID for update
          customer_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          phone: formData.phone,
          street_address: formData.street1,
          street_address_2: formData.street2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
          business_name: uspsFormData.business_name || "",
          mailbox_type: mailboxUseType === 'both' ? 'business' : mailboxUseType,
          preferred_size: preferredSize,
          notes: finalNotes, // Overwrite with the comprehensive final notes
          status: 'pending', // Still pending until payment
          payment_status: 'pending',
          start_date: new Date().toISOString().split('T')[0],
          additional_services: []
        }
      });

      if (!updateResponse.data.success) {
        throw new Error(updateResponse.data.error || "Failed to finalize reservation");
      }
      
      // Send admin notification email
      await base44.integrations.Core.SendEmail({
        to: "contact@themonarchmail.com",
        subject: `New Mailbox Application - ${formData.first_name} ${formData.last_name}`,
        body: `
New mailbox application received:

Customer: ${formData.first_name} ${formData.middle_initial ? formData.middle_initial + ' ' : ''}${formData.last_name}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.street1}, ${formData.city}, ${formData.state} ${formData.zip}
${formData.street2 ? `Apt/Suite: ${formData.street2}\n` : ''}
Country: ${formData.country}

Mailbox Type: ${mailboxUseType}
How Heard: ${formData.how_heard}${formData.referral_detail ? ` (${formData.referral_detail})` : ''}
ID Submission Method: ${formData.id_submission_method === 'upload' ? 'Documents Uploaded' : 'Will bring to store'}
Mailbox Key: ${addMailboxKey ? 'Yes' : 'No'}

Selected Products:
${selectedProducts.map(p => `- ${p.name} ${p.duration || ''}`).join('\n')}

--- USPS Form 1583 Details ---
Photo ID Type: ${uspsFormData.photo_id_type}
Photo ID Number: ${uspsFormData.photo_id_number}
Photo ID Issuing Entity: ${uspsFormData.photo_id_issuing_entity}
Photo ID Expiration: ${uspsFormData.photo_id_expiration || 'N/A'}
Address ID Type: ${uspsFormData.address_id_type}
Additional Recipients: ${uspsFormData.additional_recipients || 'None'}
${(mailboxUseType === 'business' || mailboxUseType === 'both') ? `
Business Name: ${uspsFormData.business_name}
Business Type: ${uspsFormData.business_type}
Business Phone: ${uspsFormData.business_phone || 'N/A'}
Business Address: ${uspsFormData.business_street || 'N/A'}, ${uspsFormData.business_city || 'N/A'}, ${uspsFormData.business_state || 'N/A'} ${uspsFormData.business_zip || 'N/A'}
Business Registration Place: ${uspsFormData.business_registration_place || 'N/A'}
` : ''}
--- End USPS Form 1583 Details ---

Subtotal: $${totals.subtotal.toFixed(2)}
${totals.discount > 0 ? `Coupon Discount: -$${totals.discount.toFixed(2)}\n` : ''}Tax: $${totals.tax.toFixed(2)}
Total: $${totals.total.toFixed(2)}

Reservation ID: ${reservationId}
Customer will complete payment via Stripe.
        `
      });

      // Create Stripe checkout
      const checkoutResponse = await base44.functions.invoke('createStripeCheckout', {
        type: 'mailbox_rental_full',
        data: {
          products: selectedProducts,
          coupon_code: couponCode, // Send coupon code for tracking, even if value is 0
          discount_amount: totals.discount, // Send any specific coupon discount
          reservation_id: reservationId
        }
      });

      if (checkoutResponse.data.success) {
        // Redirect to Stripe - customer and admin confirmation emails will be sent
        // via webhook after successful payment, not directly from the frontend.
        window.location.href = checkoutResponse.data.checkout_url;
      } else {
        alert("Error creating checkout session");
      }

    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error submitting application. Please call (210) 265-5805.");
    }
    setLoading(false);
  };

  const totals = calculateTotals();

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <Card className="border-0 shadow-2xl">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Application Received!</h2>
              <p className="text-lg text-gray-600 mb-8">Thank you! We'll contact you within 24 hours.</p>
              <Button onClick={() => window.location.href = '/'} className="bg-blue-900 hover:bg-blue-800">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-4xl font-bold mb-2">New Customer Application</h1>
          {user ? (
            <div>
              <p className="text-gray-600 mb-2">Welcome back, {user.full_name || user.email}! Complete your mailbox reservation below.</p>
              {isPromotionActive() && (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  50% off for new mailbox subscribers who sign up for 12+ months by December 31st, 2025
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Please fill out the form below to reserve your new mailbox.</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 5</span> {/* Updated from 4 to 5 */}
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {step === 1 && "Select mailbox type"}
            {step === 2 && "Customer information & ID"} 
            {step === 3 && "Select your mailbox"}
            {step === 4 && "USPS Form 1583"} {/* New step */}
            {step === 5 && "Review and submit"} {/* Old step 4, now step 5 */}
          </div>
        </div>

        {/* Address Validation Dialog */}
        <Dialog open={!!validationDialog} onOpenChange={() => setValidationDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Address Validation</DialogTitle>
              <DialogDescription>
                {validationDialog?.validated 
                  ? "We found a suggested correction for your address"
                  : "Please review your address"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {validationDialog?.validated && (
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">You Entered:</p>
                      <div className="text-sm bg-white p-3 rounded">
                        <p>{validationDialog.original.street1}</p>
                        {validationDialog.original.street2 && <p>{validationDialog.original.street2}</p>}
                        <p>{validationDialog.original.city}, {validationDialog.original.state} {validationDialog.original.zip}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Suggested:</p>
                      <div className="text-sm bg-green-100 p-3 rounded">
                        <p>{validationDialog.validated.street1}</p>
                        {validationDialog.validated.street2 && <p>{validationDialog.validated.street2}</p>}
                        <p>{validationDialog.validated.city}, {validationDialog.validated.state} {validationDialog.validated.zip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {validationDialog?.messages && validationDialog.messages.length > 0 && (
                <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <p className="font-semibold mb-2 text-yellow-800">Validation Messages:</p>
                  {validationDialog.messages.map((msg, index) => (
                    <p key={index} className="text-sm text-yellow-700">{msg.text || msg.message}</p>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="outline" onClick={continueWithOriginalAddress}>
                Continue with My Address
              </Button>
              {validationDialog?.validated && (
                <Button onClick={applyValidatedAddress} className="bg-green-600 hover:bg-green-700">
                  Use Suggested Address
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <AnimatePresence mode="wait">
          {/* Step 1: Choose Personal/Business/Both */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <CardTitle className="text-2xl">Will this mailbox be used for personal or business purposes?</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <RadioGroup value={mailboxUseType} onValueChange={setMailboxUseType}>
                    <div className="space-y-4">
                      <label className="flex items-center p-6 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
                        <RadioGroupItem value="personal" id="personal" className="mr-4" />
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">Personal Use</div>
                            <div className="text-sm text-gray-600">For individual household mail and packages</div>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-6 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                        <RadioGroupItem value="business" id="business" className="mr-4" />
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">Business Use</div>
                            <div className="text-sm text-gray-600">For business operations - mailing and receiving</div>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-6 border-2 rounded-lg cursor-pointer hover:border-green-500 transition-all">
                        <RadioGroupItem value="both" id="both" className="mr-4" />
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">Both Personal & Business</div>
                            <div className="text-sm text-gray-600">For both Business and Personal shipping and receiving</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  <div className="mt-8 flex justify-end">
                    <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Customer Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4"> {/* Changed to 3 columns */}
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                    </div>
                    <div>
                      <Label htmlFor="middleInitial">Middle Initial</Label> {/* New field */}
                      <Input id="middleInitial" maxLength={1} value={formData.middle_initial} onChange={(e) => setFormData({...formData, middle_initial: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="(555) 555-5555" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street1">Address *</Label>
                    <Input id="street1" className="mb-2" value={formData.street1} onChange={(e) => setFormData({...formData, street1: e.target.value})} placeholder="Street Address" required />
                    <Input id="street2" className="mb-2" value={formData.street2} onChange={(e) => setFormData({...formData, street2: e.target.value})} placeholder="Apt, Suite, Unit (optional)" />
                    <div className="grid grid-cols-3 gap-2">
                      <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="City" required />
                      <Input id="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="State" maxLength={2} required />
                      <Input id="zip" value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} placeholder="ZIP" required />
                    </div>
                    {/* Country input is implicitly "United States" for USPS form. Can be added as a disabled input if needed */}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>How did you hear about us? *</Label>
                      <Select value={formData.how_heard} onValueChange={(value) => setFormData({...formData, how_heard: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Internet">Internet</SelectItem>
                          <SelectItem value="Word of Mouth">Word of Mouth</SelectItem>
                          <SelectItem value="Drive by">Drive by</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(formData.how_heard === 'Word of Mouth' || formData.how_heard === 'Other') && (
                      <div>
                        <Label htmlFor="referralDetail">Please Specify</Label>
                        <Input id="referralDetail" value={formData.referral_detail} onChange={(e) => setFormData({...formData, referral_detail: e.target.value})} placeholder="Details..." />
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Two current forms of ID are required:</strong> One must be a photo ID. The other must include your physical address.
                    </p>
                    
                    <details className="mb-3">
                      <summary className="text-sm font-semibold text-blue-900 cursor-pointer hover:text-blue-700">
                        View Acceptable Forms of ID
                      </summary>
                      <div className="mt-3 space-y-3 text-xs">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">✓ Primary ID (must have photo):</p>
                          <p className="text-gray-700 leading-relaxed">
                            Driver's license, state ID, passport, military ID, tribal ID, permanent resident card, 
                            government-issued ID, corporate ID (limited cases), or university ID (limited cases)
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">✓ Secondary ID (must show address):</p>
                          <p className="text-gray-700 leading-relaxed">
                            Lease/mortgage/deed, voter or vehicle registration card, home or vehicle insurance policy, 
                            Form I-94, or another primary ID
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">✗ NOT Acceptable:</p>
                          <p className="text-gray-700 leading-relaxed">
                            Social Security cards, birth certificates, credit cards
                          </p>
                        </div>
                        
                        <a 
                          href="https://faq.usps.com/s/article/Acceptable-Form-of-Identification" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          View full USPS ID requirements →
                        </a>
                      </div>
                    </details>
                    
                    <Label className="font-semibold mb-2 block">How will you provide your ID documents? *</Label>
                    <RadioGroup 
                      value={formData.id_submission_method} 
                      onValueChange={(value) => setFormData({...formData, id_submission_method: value})}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="upload" id="upload_ids" />
                        <label htmlFor="upload_ids" className="cursor-pointer text-sm flex-1">
                          Upload now (for quicker processing)
                          {formData.id_submission_method === 'upload' && (
                            <span className="text-gray-500 block text-xs mt-1">
                              You'll need digital copies of your primary and secondary IDs.
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="bring_later" id="bring_ids" />
                        <label htmlFor="bring_ids" className="cursor-pointer text-sm flex-1">
                          Bring to store later (before activation)
                          {formData.id_submission_method === 'bring_later' && (
                            <span className="text-gray-500 block text-xs mt-1">
                              You can bring your physical IDs to our location for verification.
                            </span>
                          )}
                        </label>
                      </div>
                    </RadioGroup>

                    {formData.id_submission_method === 'upload' && (
                      <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-4">
                        <div>
                          <Label htmlFor="primary_id_upload">Primary Photo ID *</Label>
                          <Input 
                            id="primary_id_upload" 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setIdDocuments({...idDocuments, primary_id: e.target.files[0]})} 
                            className="p-2 h-auto"
                          />
                          {idDocuments.primary_id && (
                            <p className="text-xs text-gray-600 mt-1">Selected: {idDocuments.primary_id.name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="secondary_id_upload">Secondary ID (with address) *</Label>
                          <Input 
                            id="secondary_id_upload" 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setIdDocuments({...idDocuments, secondary_id: e.target.files[0]})} 
                            className="p-2 h-auto"
                          />
                          {idDocuments.secondary_id && (
                            <p className="text-xs text-gray-600 mt-1">Selected: {idDocuments.secondary_id.name}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF. Max file size: 5MB.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack} className="px-8 py-6 text-lg" disabled={validatingAddress || uploadingIds}>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg" disabled={validatingAddress || uploadingIds}>
                      {(validatingAddress || uploadingIds) ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {uploadingIds ? 'Uploading IDs...' : 'Validating Address...'}
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Select Mailbox */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-xl mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle>Select Your Mailbox</CardTitle>
                  {mailboxUseType === 'both' && (
                    <CardDescription>Since you selected both personal and business, we'll set up a Business Mailbox (which can be used for both purposes)</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Mailbox Key Add-on */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Add-ons</h3>
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      addMailboxKey ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox checked={addMailboxKey} onCheckedChange={setAddMailboxKey} />
                        <div>
                          <div className="font-semibold">Mailbox Key</div>
                          <div className="text-xs text-gray-600 mt-1">Without a mailbox key, a staff member will assist you in checking your box</div>
                        </div>
                      </div>
                      <span className="text-lg font-bold">${pricing.key.toFixed(2)}</span>
                    </label>
                  </div>

                  {/* Personal Mailbox - Only show if NOT 'both' */}
                  {mailboxUseType === 'personal' && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Personal Mailbox
                        <Badge variant="outline">For Individuals</Badge>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="personalSize">Size</Label>
                          <Select id="personalSize" value={personalMailbox.size} onValueChange={(value) => setPersonalMailbox({...personalMailbox, size: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="personalDuration">Duration</Label>
                          <Select 
                            id="personalDuration"
                            value={personalMailbox.duration} 
                            onValueChange={(value) => setPersonalMailbox({...personalMailbox, duration: value})}
                            disabled={!personalMailbox.size}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">
                                3 Months - ${personalMailbox.size ? pricing.personal[personalMailbox.size]['3'].toFixed(2) : '—'}
                              </SelectItem>
                              <SelectItem value="6">
                                6 Months - ${personalMailbox.size ? pricing.personal[personalMailbox.size]['6'].toFixed(2) : '—'}
                              </SelectItem>
                              <SelectItem value="12">
                                12 Months - {personalMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.personal[personalMailbox.size]['12'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.personal[personalMailbox.size]['12'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${personalMailbox.size ? pricing.personal[personalMailbox.size]['12'].toFixed(2) : '—'}`}
                              </SelectItem>
                              <SelectItem value="18">
                                18 Months - {personalMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.personal[personalMailbox.size]['18'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.personal[personalMailbox.size]['18'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${personalMailbox.size ? pricing.personal[personalMailbox.size]['18'].toFixed(2) : '—'}`}
                              </SelectItem>
                              <SelectItem value="24">
                                24 Months - {personalMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.personal[personalMailbox.size]['24'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.personal[personalMailbox.size]['24'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${personalMailbox.size ? pricing.personal[personalMailbox.size]['24'].toFixed(2) : '—'}`}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {getPersonalPrice() > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <span className="font-semibold">Selected: </span>
                          <span className="text-blue-900">
                            {personalMailbox.size.charAt(0).toUpperCase() + personalMailbox.size.slice(1)} - {personalMailbox.duration} months
                          </span>
                          <span className="float-right font-bold text-blue-900">${getPersonalPrice().toFixed(2)}</span>
                        </div>
                      )}
                      {isPromotionActive() && parseInt(personalMailbox.duration) >= 12 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> 50% off promotion applied! Offer valid until December 31st, 2025.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Business Mailbox - Show for 'business' OR 'both' */}
                  {(mailboxUseType === 'business' || mailboxUseType === 'both') && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Business Mailbox
                        <Badge variant="outline">For Businesses</Badge>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessSize">Size</Label>
                          <Select id="businessSize" value={businessMailbox.size} onValueChange={(value) => setBusinessMailbox({...businessMailbox, size: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="businessDuration">Duration</Label>
                          <Select 
                            id="businessDuration"
                            value={businessMailbox.duration} 
                            onValueChange={(value) => setBusinessMailbox({...businessMailbox, duration: value})}
                            disabled={!businessMailbox.size}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">
                                3 Months - ${businessMailbox.size ? pricing.business[businessMailbox.size]['3'].toFixed(2) : '—'}
                              </SelectItem>
                              <SelectItem value="6">
                                6 Months - ${businessMailbox.size ? pricing.business[businessMailbox.size]['6'].toFixed(2) : '—'}
                              </SelectItem>
                              <SelectItem value="12">
                                12 Months - {businessMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.business[businessMailbox.size]['12'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.business[businessMailbox.size]['12'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${businessMailbox.size ? pricing.business[businessMailbox.size]['12'].toFixed(2) : '—'}`}
                              </SelectItem>
                              <SelectItem value="18">
                                18 Months - {businessMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.business[businessMailbox.size]['18'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.business[businessMailbox.size]['18'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${businessMailbox.size ? pricing.business[businessMailbox.size]['18'].toFixed(2) : '—'}`}
                              </SelectItem>
                              <SelectItem value="24">
                                24 Months - {businessMailbox.size && isPromotionActive() ? (
                                  <span>
                                    <span className="line-through text-gray-400">${pricing.business[businessMailbox.size]['24'].toFixed(2)}</span>
                                    {' '}<span className="text-green-600 font-bold">${(pricing.business[businessMailbox.size]['24'] * 0.5).toFixed(2)}</span>
                                  </span>
                                ) : `$${businessMailbox.size ? pricing.business[businessMailbox.size]['24'].toFixed(2) : '—'}`}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {getBusinessPrice() > 0 && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                          <span className="font-semibold">Selected: </span>
                          <span className="text-purple-900">
                            {businessMailbox.size.charAt(0).toUpperCase() + businessMailbox.size.slice(1)} - {businessMailbox.duration} months
                          </span>
                          <span className="float-right font-bold text-purple-900">${getBusinessPrice().toFixed(2)}</span>
                        </div>
                      )}
                      {isPromotionActive() && parseInt(businessMailbox.duration) >= 12 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> 50% off promotion applied! Offer valid until December 31st, 2025.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subtotal Summary */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {addMailboxKey && (
                      <div className="flex justify-between text-sm">
                        <span>Mailbox Key</span>
                        <span className="font-semibold">${pricing.key.toFixed(2)}</span>
                      </div>
                    )}
                    {mailboxUseType === 'personal' && getPersonalPrice() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>{personalMailbox.size.charAt(0).toUpperCase() + personalMailbox.size.slice(1)} Personal Mailbox ({personalMailbox.duration} months)</span>
                        <span className="font-semibold">${getPersonalPrice().toFixed(2)}</span>
                      </div>
                    )}
                    {(mailboxUseType === 'business' || mailboxUseType === 'both') && getBusinessPrice() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>{businessMailbox.size.charAt(0).toUpperCase() + businessMailbox.size.slice(1)} Business Mailbox ({businessMailbox.duration} months)</span>
                        <span className="font-semibold">${getBusinessPrice().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack} className="px-8 py-6 text-lg">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: USPS Form 1583 */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-2xl">USPS Form 1583 - Application for Delivery of Mail Through Agent</CardTitle>
                  <CardDescription>Required by the United States Postal Service</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Photo ID Information */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">8. Photo ID Information</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                      <p className="font-semibold mb-2">Photo ID Name (auto-filled from your information):</p>
                      <p>{formData.last_name}, {formData.first_name} {formData.middle_initial}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="photo_id_type">8a. Photo ID Type *</Label>
                        <Select
                          value={uspsFormData.photo_id_type}
                          onValueChange={(value) => setUspsFormData({...uspsFormData, photo_id_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Drivers License or ID card issued by US State dept, Territory, or Tribe">Driver's License / State ID</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Uniformed Service ID">Military ID</SelectItem>
                            <SelectItem value="US Access Card">US Access Card</SelectItem>
                            <SelectItem value="US University ID Card">University ID</SelectItem>
                            <SelectItem value="Matricula Consular">Matricula Consular</SelectItem>
                            <SelectItem value="Nexus Card">NEXUS Card</SelectItem>
                            <SelectItem value="Certificate of Naturalization">Certificate of Naturalization</SelectItem>
                            <SelectItem value="US Permanent Resident Card">Permanent Resident Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="photo_id_number">8b. ID Number (on your Photo ID) *</Label>
                        <Input
                          id="photo_id_number"
                          value={uspsFormData.photo_id_number}
                          onChange={(e) => setUspsFormData({...uspsFormData, photo_id_number: e.target.value})}
                          placeholder="Enter ID number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="photo_id_issuing">8c. Issuing Entity *</Label>
                        <Input
                          id="photo_id_issuing"
                          value={uspsFormData.photo_id_issuing_entity}
                          onChange={(e) => setUspsFormData({...uspsFormData, photo_id_issuing_entity: e.target.value})}
                          placeholder="e.g., TX DPS, Dept of State"
                        />
                      </div>

                      <div>
                        <Label htmlFor="photo_id_exp">8d. Expiration Date</Label>
                        <Input
                          id="photo_id_exp"
                          type="date"
                          value={uspsFormData.photo_id_expiration}
                          onChange={(e) => setUspsFormData({...uspsFormData, photo_id_expiration: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address ID Information */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">9. Address ID Information</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                      <p className="font-semibold mb-2">Address on file (auto-filled):</p>
                      <p>{formData.street1}{formData.street2 ? `, ${formData.street2}` : ''}</p>
                      <p>{formData.city}, {formData.state} {formData.zip}</p>
                    </div>

                    <div>
                      <Label htmlFor="address_id_type">9a. Address ID Type *</Label>
                      <Select
                        value={uspsFormData.address_id_type}
                        onValueChange={(value) => setUspsFormData({...uspsFormData, address_id_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Address ID Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {uspsFormData.photo_id_type !== "Drivers License or ID card issued by US State dept, Territory, or Tribe" && (
                            <SelectItem value="Drivers License or ID card">Driver's License / State ID</SelectItem>
                          )}
                          <SelectItem value="Current Lease">Current Lease</SelectItem>
                          <SelectItem value="Mortgage or Deed of trust">Mortgage or Deed of Trust</SelectItem>
                          <SelectItem value="Home or Vehicle insurance policy">Home/Vehicle Insurance Policy</SelectItem>
                          <SelectItem value="Vehicle Registration Card">Vehicle Registration Card</SelectItem>
                          <SelectItem value="Voter Card">Voter Registration Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {uspsFormData.photo_id_type === "Drivers License or ID card issued by US State dept, Territory, or Tribe" && 
                          "Note: A single ID cannot be used for both Photo ID and Address ID. Please select a different type for Address ID if you used a Driver's License for Photo ID."}
                      </p>
                    </div>
                  </div>

                  {/* Business Information - only if business type */}
                  {(mailboxUseType === 'business' || mailboxUseType === 'both') && (
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold mb-4">7. Business/Organization Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="business_name">7a. Name of Business/Organization *</Label>
                          <Input
                            id="business_name"
                            value={uspsFormData.business_name}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_name: e.target.value})}
                            placeholder="Enter business name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_type">7b. Type of Business *</Label>
                          <Input
                            id="business_type"
                            value={uspsFormData.business_type}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_type: e.target.value})}
                            placeholder="e.g., LLC, Corporation, Sole Proprietor"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_phone">7h. Business Phone</Label>
                          <Input
                            id="business_phone"
                            type="tel"
                            value={uspsFormData.business_phone}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_phone: e.target.value})}
                            placeholder="(555) 555-5555"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="business_street">7c. Business Street Address</Label>
                          <Input
                            id="business_street"
                            value={uspsFormData.business_street}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_street: e.target.value})}
                            placeholder="Street address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_city">7d. City</Label>
                          <Input
                            id="business_city"
                            value={uspsFormData.business_city}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_city: e.target.value})}
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_state">7e. State</Label>
                          <Input
                            id="business_state"
                            value={uspsFormData.business_state}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_state: e.target.value})}
                            placeholder="State"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_zip">7f. ZIP Code</Label>
                          <Input
                            id="business_zip"
                            value={uspsFormData.business_zip}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_zip: e.target.value})}
                            placeholder="ZIP Code"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_registration">7i. Place of Registration</Label>
                          <Input
                            id="business_registration"
                            value={uspsFormData.business_registration_place}
                            onChange={(e) => setUspsFormData({...uspsFormData, business_registration_place: e.target.value})}
                            placeholder="County, State"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Recipients */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">12. Exceptions for Additional Recipients of Mail</h3>
                    <Label htmlFor="additional_recipients">Who else can pick up your mail? (Optional)</Label>
                    <Textarea
                      id="additional_recipients"
                      value={uspsFormData.additional_recipients}
                      onChange={(e) => setUspsFormData({...uspsFormData, additional_recipients: e.target.value})}
                      placeholder="Enter names of additional people authorized to receive your mail, one per line"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={handleBack} className="px-8 py-6 text-lg">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
                      Continue to Review
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Review and Submit (previously step 4) */}
          {step === 5 && (
            <motion.div
              key="step5" // Changed key from step4 to step5
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Pricing Summary */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle>Final Total</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!isPromotionActive() && (
                    <div className="mb-4">
                      <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                      <div className="flex gap-2">
                        <Input id="couponCode" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" />
                        <Button onClick={applyCoupon} variant="outline">Apply</Button>
                      </div>
                      {couponDiscount > 0 && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Coupon applied!
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-lg text-green-600">
                        <span>Discount:</span>
                        <span>-${totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg">
                      <span>Tax ({ (TAX_RATE * 100).toFixed(2) }%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-900">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Mailbox Rental Agreement</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm mb-4">
                    <p className="mb-2">1. By completing this form, applicant appoints Tezal Mail LLC (dba Monarch Mail) as agent for mail receipt for the period rent is paid. Applicant will pick up mail at least once monthly.</p>
                    <p className="mb-2">2. Keys remain Monarch Mail property and shall not be duplicated.</p>
                    <p className="mb-2">3. Once mail is placed in assigned lockbox, it is deemed delivered. Monarch Mail is not responsible for loss, theft, or damage.</p>
                    <p className="mb-2">4. Applicant agrees to use services per Monarch Mail rules and USPS regulations.</p>
                    <p className="mb-2">5. Information kept confidential except for law enforcement purposes.</p>
                    <p className="mb-2">6. Monarch Mail reserves right to require larger box. High volume may result in additional fees or termination.</p>
                    <p className="mb-2">7. Certified, registered, or insured mail accepted per USPS regulations.</p>
                    <p className="mb-2">8. Fees due in advance. Late payment = $10 late fee. No prorating or refunds. You agree to receive renewal notifications via phone/text/email.</p>
                    <p className="mb-2">9. Upon termination or non-payment, mail held until payment made.</p>
                    <p className="mb-2">10. Submission = agreement to terms. You opt into email/SMS notifications primarily for package alerts.</p>
                    <p className="mb-2">11. Use only PMB designation: Your Name/Business, 20711 Wilderness Oak Ste 107 PMB (your mailbox #), San Antonio, TX 78258</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={setAgreeToTerms} className="mt-1" />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      By checking this box, I agree to the terms & conditions above. *
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} className="px-8 py-6 text-lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !agreeToTerms || totals.total === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay ${totals.total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
