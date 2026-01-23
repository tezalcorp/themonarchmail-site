import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Package, CheckCircle, Download, Store, ArrowRight, AlertCircle, CheckCircle2, Shield, Plus, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateShipment() {
  return <AuthenticatedCreateShipment />;
}

function AuthenticatedCreateShipment() {
  const [step, setStep] = useState(1);
  const [fromAddress, setFromAddress] = useState({
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  });
  const [toAddress, setToAddress] = useState({
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: ""
  });
  const [parcel, setParcel] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
    weight_oz: "",
    distance_unit: "in",
    mass_unit: "lb"
  });
  // Removed: const [isMediaMail, setIsMediaMail] = useState(false);
  // Removed: const [showMediaMailWarning, setShowMediaMailWarning] = useState(false);
  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [printLocation, setPrintLocation] = useState("home");
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationDialog, setValidationDialog] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [originalUserAddress, setOriginalUserAddress] = useState(null);
  const [showUpdateAddressPrompt, setShowUpdateAddressPrompt] = useState(false);
  const [toAddressSearch, setToAddressSearch] = useState("");
  const [showToAddressResults, setShowToAddressResults] = useState(false);
  const [showManualToAddress, setShowManualToAddress] = useState(false);
  const [showSaveAddressPrompt, setShowSaveAddressPrompt] = useState(false);
  const [addressLabelToSave, setAddressLabelToSave] = useState("");
  const [isToAddressFromSaved, setIsToAddressFromSaved] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null); // New state for selected saved address ID

  const searchRef = useRef(null); // Ref for the search input container
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['savedAddresses'],
    queryFn: () => base44.entities.SavedAddress.filter({ created_by: user?.email }, '-times_used'),
    enabled: !!user,
    initialData: []
  });

  // Pre-fill from address with user's profile information
  useEffect(() => {
    if (user && !fromAddress.name) {
      const userAddr = {
        name: user.full_name || "",
        street1: user.street_address || "",
        street2: user.street_address_2 || "",
        city: user.city || "",
        state: user.state || "",
        zip: user.zip_code || "",
        country: "US"
      };
      setFromAddress(userAddr);
      setOriginalUserAddress(userAddr);
    }
  }, [user]);

  // Handle clicks outside the search results to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowToAddressResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter saved addresses based on search
  const filteredToAddresses = useMemo(() => {
    if (!toAddressSearch) return savedAddresses;
    const searchLower = toAddressSearch.toLowerCase();
    return savedAddresses.filter(addr =>
      addr.label.toLowerCase().includes(searchLower) ||
      addr.recipient_name.toLowerCase().includes(searchLower) ||
      (addr.company && addr.company.toLowerCase().includes(searchLower)) ||
      (addr.street_address && addr.street_address.toLowerCase().includes(searchLower)) ||
      (addr.city && addr.city.toLowerCase().includes(searchLower)) ||
      (addr.state && addr.state.toLowerCase().includes(searchLower)) ||
      (addr.zip_code && addr.zip_code.toLowerCase().includes(searchLower))
    );
  }, [toAddressSearch, savedAddresses]);

  const hasAddressChanged = () => {
    if (!originalUserAddress) return false;
    return (
      fromAddress.name !== originalUserAddress.name ||
      fromAddress.street1 !== originalUserAddress.street1 ||
      fromAddress.street2 !== originalUserAddress.street2 ||
      fromAddress.city !== originalUserAddress.city ||
      fromAddress.state !== originalUserAddress.state ||
      fromAddress.zip !== originalUserAddress.zip
    );
  };

  const updateUserProfile = async () => {
    try {
      await base44.auth.updateMe({
        full_name: fromAddress.name,
        street_address: fromAddress.street1,
        street_address_2: fromAddress.street2,
        city: fromAddress.city,
        state: fromAddress.state,
        zip_code: fromAddress.zip
      });
      setOriginalUserAddress(fromAddress);
      setShowUpdateAddressPrompt(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const calculateTotalWeight = () => {
    const lbs = parseFloat(parcel.weight) || 0;
    const oz = parseFloat(parcel.weight_oz) || 0;
    let totalWeight = lbs + (oz / 16);

    // Round up to 1 oz minimum (same as Shippo)
    if (totalWeight > 0 && totalWeight < 0.0625) { // 0.0625 lbs = 1 oz
      totalWeight = 0.0625;
    }

    return totalWeight;
  };

  const validateAddresses = async () => {
    setValidating(true);
    try {
      const [fromValidation, toValidation] = await Promise.all([
        base44.functions.invoke('validateAddress', { address: fromAddress }),
        base44.functions.invoke('validateAddress', { address: toAddress })
      ]);

      // Helper function to check if addresses are essentially the same
      const addressesMatch = (original, validated) => {
        if (!validated) return true; // If no validated address, treat as a match for skipping correction dialog
        return (
          original.street1.toLowerCase().trim() === validated.street1.toLowerCase().trim() &&
          original.city.toLowerCase().trim() === validated.city.toLowerCase().trim() &&
          original.state.toLowerCase().trim() === validated.state.toLowerCase().trim() &&
          original.zip.trim() === validated.zip.trim()
        );
      };

      const fromHasValidatedSuggestion = !!fromValidation.data.validated;
      const toHasValidatedSuggestion = !!toValidation.data.validated;

      const fromNeedsCorrection = fromHasValidatedSuggestion &&
        !addressesMatch(fromAddress, fromValidation.data.validated);

      const toNeedsCorrection = toHasValidatedSuggestion &&
        !addressesMatch(toAddress, toValidation.data.validated);

      const fromHasErrors = !fromValidation.data.is_valid ||
        (fromValidation.data.messages && fromValidation.data.messages.length > 0);

      const toHasErrors = !toValidation.data.is_valid ||
        (toValidation.data.messages && toValidation.data.messages.length > 0);

      // Only show dialog if there are actual corrections or errors
      if (fromNeedsCorrection || toNeedsCorrection || fromHasErrors || toHasErrors) {
        setValidationDialog({
          from: (fromNeedsCorrection || fromHasErrors) ? { ...fromValidation.data, original: fromAddress } : null,
          to: (toNeedsCorrection || toHasErrors) ? { ...toValidation.data, original: toAddress } : null
        });
        setValidating(false);
        return false;
      }

      setValidating(false);
      return true; // No significant corrections or errors, proceed
    } catch (error) {
      alert("Address validation failed. Please check your addresses.");
      setValidating(false);
      return false;
    }
  };

  const executeGetRatesLogic = async () => {
    const totalWeight = calculateTotalWeight();

    const isValid = await validateAddresses();
    if (!isValid) return;

    setLoading(true);
    try {
      const parcelToSend = {
        ...parcel,
        weight: totalWeight.toString()
      };
      // Remove weight_oz as the backend only expects 'weight' in lbs
      delete parcelToSend.weight_oz;

      const response = await base44.functions.invoke('getAllShippingRates', {
        from_address: fromAddress,
        to_address: toAddress,
        parcel: parcelToSend,
        // Removed: is_media_mail: isMediaMail
      });

      if (response.data.success) {
        setRates(response.data.rates || []);
        setStep(2);
      } else {
        alert(response.data.error || "Failed to get rates");
      }
    } catch (error) {
      alert("Error getting rates: " + error.message);
    }
    setLoading(false);
  };

  const handleGetRates = async () => {
    // Check if address changed and prompt user
    if (hasAddressChanged() && !showUpdateAddressPrompt) {
      setShowUpdateAddressPrompt(true);
      return;
    }

    // Check if to address is new and should be saved
    if (!isToAddressFromSaved && toAddress.name && toAddress.street1 && toAddress.city && toAddress.state && toAddress.zip) {
      setShowSaveAddressPrompt(true);
      return;
    }

    await executeGetRatesLogic();
  };

  const continueWithoutUpdating = async () => {
    setShowUpdateAddressPrompt(false);

    // Check if to address is new and should be saved
    if (!isToAddressFromSaved && toAddress.name && toAddress.street1 && toAddress.city && toAddress.state && toAddress.zip) {
      setShowSaveAddressPrompt(true);
      return;
    }

    await executeGetRatesLogic();
  };

  const saveToAddressAndContinue = async () => {
    try {
      const newAddress = await base44.entities.SavedAddress.create({
        label: addressLabelToSave || toAddress.name,
        recipient_name: toAddress.name,
        company: "",
        street_address: toAddress.street1,
        street_address_2: toAddress.street2 || "",
        city: toAddress.city,
        state: toAddress.state,
        zip_code: toAddress.zip,
        country: toAddress.country,
        phone: toAddress.phone,
        times_used: 1
      });

      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
      setShowSaveAddressPrompt(false);
      setAddressLabelToSave("");
      setIsToAddressFromSaved(true);
      setSelectedSavedAddressId(newAddress.id); // Set the ID for the newly saved address

      // Now continue with validation and getting rates
      await executeGetRatesLogic();

    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
    }
  };

  const continueWithoutSaving = async () => {
    setShowSaveAddressPrompt(false);
    setAddressLabelToSave("");

    await executeGetRatesLogic();
  };

  const handlePurchase = async () => {
    if (printLocation === 'store') {
      try {
        const totalWeight = calculateTotalWeight();
        const parcelToSend = {
          ...parcel,
          weight: totalWeight.toString()
        };
        delete parcelToSend.weight_oz;

        await base44.entities.PendingShipment.create({
          from_address: fromAddress,
          to_address: toAddress,
          parcel: parcelToSend,
          selected_rate: selectedRate,
          print_location: printLocation,
          status: 'pending'
        });

        setPurchaseSuccess({
          type: 'pending',
          message: 'Shipment saved! Visit store to complete.'
        });
      } catch (error) {
        alert("Error saving shipment.");
      }
      return;
    }

    // For home printing - go to Stripe checkout
    setPurchasing(true);
    try {
      const totalWeight = calculateTotalWeight();
      const parcelToSend = {
        ...parcel,
        weight: totalWeight.toString()
      };
      delete parcelToSend.weight_oz;

      const response = await base44.functions.invoke('createStripeCheckout', {
        type: 'shipping_label',
        data: {
          rate: selectedRate,
          rate_id: selectedRate.rate_id,
          from_address: fromAddress,
          to_address: toAddress,
          parcel: parcelToSend
        }
      });

      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        alert(response.data.error || "Failed to create checkout session");
      }
    } catch (error) {
      alert("Error creating checkout: " + error.message);
    }
    setPurchasing(false);
  };

  const applySavedAddress = (address, type) => {
    const addressData = {
      name: address.recipient_name,
      street1: address.street_address,
      street2: address.street_address_2 || "",
      city: address.city,
      state: address.state,
      zip: address.zip_code,
      country: address.country || "US", // Ensure country is set from saved address, default to US
      phone: address.phone || "" // Ensure phone is set from saved address
    };

    if (type === 'from') {
      setFromAddress(addressData);
    } else {
      setToAddress(addressData);
      setToAddressSearch(address.label || address.recipient_name); // Set search field to the label or name of selected address
      setShowToAddressResults(false);
      setShowManualToAddress(false);
      setIsToAddressFromSaved(true);
      setSelectedSavedAddressId(address.id); // Store the ID
    }

    base44.entities.SavedAddress.update(address.id, {
      times_used: (address.times_used || 0) + 1
    });
  };

  const handleAddNewToAddress = () => {
    setShowManualToAddress(true);
    setShowToAddressResults(false);
    setIsToAddressFromSaved(false);
    setSelectedSavedAddressId(null); // Clear selected saved address ID
    setToAddress({
      name: toAddressSearch, // Pre-fill name with whatever was typed
      street1: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "US", // Default country
      phone: "" // Reset phone
    });
  };

  const applyValidatedAddress = async (type) => {
    if (type === 'from' && validationDialog?.from?.validated) {
      setFromAddress({
        ...fromAddress,
        street1: validationDialog.from.validated.street1,
        street2: validationDialog.from.validated.street2 || "",
        city: validationDialog.from.validated.city,
        state: validationDialog.from.validated.state,
        zip: validationDialog.from.validated.zip
      });

      // Remove from address from validation dialog, keep to address if it exists
      if (validationDialog.to) {
        setValidationDialog({ from: null, to: validationDialog.to });
      } else {
        setValidationDialog(null);
      }
    } else if (type === 'to' && validationDialog?.to?.validated) {
      const correctedAddress = {
        ...toAddress,
        street1: validationDialog.to.validated.street1,
        street2: validationDialog.to.validated.street2 || "",
        city: validationDialog.to.validated.city,
        state: validationDialog.to.validated.state,
        zip: validationDialog.to.validated.zip,
        country: validationDialog.to.validated.country || toAddress.country, // Ensure country is updated if validated
        phone: validationDialog.to.validated.phone || toAddress.phone // Ensure phone is updated if validated
      };

      setToAddress(correctedAddress);

      // If this address came from saved addresses, update it in the database
      if (isToAddressFromSaved && selectedSavedAddressId) {
        try {
          await base44.entities.SavedAddress.update(selectedSavedAddressId, {
            recipient_name: correctedAddress.name,
            street_address: correctedAddress.street1,
            street_address_2: correctedAddress.street2,
            city: correctedAddress.city,
            state: correctedAddress.state,
            zip_code: correctedAddress.zip,
            country: correctedAddress.country,
            phone: correctedAddress.phone,
          });

          // Refresh saved addresses
          queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
        } catch (error) {
          console.error("Error updating saved address:", error);
          // Optionally, show a toast or alert that saving failed
        }
      }

      // Remove to address from validation dialog, keep from address if it exists
      if (validationDialog.from) {
        setValidationDialog({ from: validationDialog.from, to: null });
      } else {
        setValidationDialog(null);
      }
    }
  };

  // Group rates by carrier for display
  const groupedRates = useMemo(() => {
    const groups = {};
    (rates || []).forEach(rate => {
      if (!groups[rate.carrier]) {
        groups[rate.carrier] = [];
      }
      groups[rate.carrier].push(rate);
    });
    return groups;
  }, [rates]);

  // Best Value - cheapest per carrier
  const bestValueByCarrier = useMemo(() => {
    if (!rates || rates.length === 0) return [];
    const result = [];
    Object.entries(groupedRates).forEach(([carrier, carrierRates]) => {
      const cheapest = carrierRates.reduce((min, rate) => rate.amount < min.amount ? rate : min);
      result.push(cheapest);
    });
    return result.sort((a, b) => a.amount - b.amount);
  }, [rates, groupedRates]);

  // Fastest - quickest delivery per carrier
  const fastestByCarrier = useMemo(() => {
    if (!rates || rates.length === 0) return [];
    const result = [];
    Object.entries(groupedRates).forEach(([carrier, carrierRates]) => {
      // Filter to only rates with estimated_days
      const withDays = carrierRates.filter(r => r.estimated_days != null);
      if (withDays.length > 0) {
        const fastest = withDays.reduce((min, rate) =>
          rate.estimated_days < min.estimated_days ? rate : min
        );
        result.push(fastest);
      }
    });
    return result.sort((a, b) => a.estimated_days - b.estimated_days);
  }, [rates, groupedRates]);

  // Best Value - Guaranteed Delivery (only truly guaranteed services)
  const bestValueGuaranteed = useMemo(() => {
    if (!rates || rates.length === 0) return [];

    // Whitelist of guaranteed services by carrier
    const GUARANTEED_SERVICES = {
      'UPS': [
        '2 day air a.m.',
        'next day air',
        'next day air saver',
        'next day air early',
        'worldwide express plus',
        'worldwide express',
        'worldwide express na1',
        'worldwide saver',
        'worldwide express freight midday',
        'worldwide express freight'
      ],
      'USPS': [
        'priority mail express'
      ],
      'FedEx': [
        'first overnight',
        'priority overnight',
        'standard overnight',
        '2day a.m.',
        'first overnight extra hours',
        'priority overnight extra hours',
        'standard overnight extra hours',
        'international first',
        'international priority',
        'international priority express',
        'international priority freight',
        'international priority directdistribution',
        'international priority directdistribution freight'
      ]
    };

    // Filter to only guaranteed services
    const guaranteed = rates.filter(r => {
      if (!r.estimated_days) return false;

      const carrier = r.carrier;
      const serviceLower = r.service_level.toLowerCase();

      const carrierGuaranteed = GUARANTEED_SERVICES[carrier] || [];
      return carrierGuaranteed.some(guaranteedService =>
        serviceLower.includes(guaranteedService)
      );
    });

    return guaranteed.sort((a, b) => a.amount - b.amount);
  }, [rates]);

  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />

              {purchaseSuccess.type === 'pending' ? (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipment Saved!</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Visit our store to complete the purchase
                  </p>
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <p className="text-sm text-gray-700">
                      📍 20711 Wilderness Oak Ste 107, San Antonio, TX 78258
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Label Purchased!</h2>
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <p className="mb-2"><strong>Tracking:</strong> {purchaseSuccess.label.tracking_number}</p>
                    <p className="mb-2"><strong>Carrier:</strong> {purchaseSuccess.label.carrier}</p>
                    <p className="text-2xl font-bold text-green-700">${purchaseSuccess.label.rate.toFixed(2)}</p>
                  </div>
                  <a href={purchaseSuccess.label.label_url} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-blue-900 hover:bg-blue-800 mb-4">
                      <Download className="w-5 h-5 mr-2" />
                      Download Label
                    </Button>
                  </a>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => window.location.href = '/MyAccount'}
                className="w-full"
              >
                View My Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Create Shipment</h1>

        {/* Update Address Prompt Dialog */}
        <Dialog open={showUpdateAddressPrompt} onOpenChange={setShowUpdateAddressPrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Your Account Address?</DialogTitle>
              <DialogDescription>
                You've changed your "From" address. Would you like to update your account profile with this new address?
              </DialogDescription>
            </DialogHeader>

            <div className="bg-blue-50 rounded-lg p-4 my-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">New Address:</p>
              <p className="text-sm text-gray-700">{fromAddress.name}</p>
              <p className="text-sm text-gray-700">{fromAddress.street1}</p>
              {fromAddress.street2 && <p className="text-sm text-gray-700">{fromAddress.street2}</p>}
              <p className="text-sm text-gray-700">{fromAddress.city}, {fromAddress.state} {fromAddress.zip}</p>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={continueWithoutUpdating}
              >
                No, Continue Without Updating
              </Button>
              <Button
                onClick={async () => {
                  await updateUserProfile();
                  continueWithoutUpdating();
                }}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Yes, Update My Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Address Prompt Dialog */}
        <Dialog open={showSaveAddressPrompt} onOpenChange={setShowSaveAddressPrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Address to Address Book?</DialogTitle>
              <DialogDescription>
                Would you like to save this address for future shipments?
              </DialogDescription>
            </DialogHeader>

            <div className="bg-blue-50 rounded-lg p-4 my-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Address:</p>
              <p className="text-sm text-gray-700">{toAddress.name}</p>
              <p className="text-sm text-gray-700">{toAddress.street1}</p>
              {toAddress.street2 && <p className="text-sm text-gray-700">{toAddress.street2}</p>}
              <p className="text-sm text-gray-700">{toAddress.city}, {toAddress.state} {toAddress.zip}</p>
              <p className="text-sm text-gray-700">{toAddress.country}</p>
              {toAddress.phone && <p className="text-sm text-gray-700">Phone: {toAddress.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLabel">Address Label (Optional)</Label>
              <Input
                id="addressLabel"
                value={addressLabelToSave}
                onChange={(e) => setAddressLabelToSave(e.target.value)}
                placeholder="e.g., Mom, Office, John's House"
              />
              <p className="text-xs text-gray-500">If not provided, we'll use the recipient's name</p>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={continueWithoutSaving}
              >
                Continue Without Saving
              </Button>
              <Button
                onClick={saveToAddressAndContinue}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Save & Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Address Validation Dialog */}
        <Dialog open={!!validationDialog} onOpenChange={() => setValidationDialog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Address Validation</DialogTitle>
              <DialogDescription>Review address corrections</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {validationDialog?.from && validationDialog.from.validated && (
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold mb-3">From Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">You Entered:</p>
                      <div className="text-sm bg-white p-3 rounded">
                        <p>{validationDialog.from.original.street1}</p>
                        <p>{validationDialog.from.original.city}, {validationDialog.from.original.state} {validationDialog.from.original.zip}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Suggested:</p>
                      <div className="text-sm bg-green-100 p-3 rounded">
                        <p>{validationDialog.from.validated.street1}</p>
                        <p>{validationDialog.from.validated.street2 && validationDialog.from.validated.street2 + ', '}{validationDialog.from.validated.city}, {validationDialog.from.validated.state} {validationDialog.from.validated.zip}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => applyValidatedAddress('from')}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700"
                  >
                    Use Corrected Address
                  </Button>
                </div>
              )}

              {validationDialog?.to && validationDialog.to.validated && (
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold mb-3">To Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">You Entered:</p>
                      <div className="text-sm bg-white p-3 rounded">
                        <p>{validationDialog.to.original.street1}</p>
                        <p>{validationDialog.to.original.city}, {validationDialog.to.original.state} {validationDialog.to.original.zip}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Suggested:</p>
                      <div className="text-sm bg-green-100 p-3 rounded">
                        <p>{validationDialog.to.validated.street1}</p>
                        <p>{validationDialog.to.validated.street2 && validationDialog.to.validated.street2 + ', '}{validationDialog.to.validated.city}, {validationDialog.to.validated.state} {validationDialog.to.validated.zip}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => applyValidatedAddress('to')}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700"
                  >
                    {isToAddressFromSaved
                      ? "Use Corrected & Update Address Book"
                      : "Use Corrected Address"}
                  </Button>
                </div>
              )}

              {(validationDialog?.from?.messages?.length > 0 && !validationDialog.from.validated) && (
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold mb-3 text-red-700">From Address Issues</h3>
                  {validationDialog.from.messages.map((msg, index) => (
                    <p key={index} className="text-sm text-red-600">{msg}</p>
                  ))}
                </div>
              )}

              {(validationDialog?.to?.messages?.length > 0 && !validationDialog.to.validated) && (
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold mb-3 text-red-700">To Address Issues</h3>
                  {validationDialog.to.messages.map((msg, index) => (
                    <p key={index} className="text-sm text-red-600">{msg}</p>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setValidationDialog(null)}>
                Edit Manually
              </Button>
              <Button onClick={handleGetRates}>
                Continue Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {step === 1 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>From Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div>
                    <Label>Quick Select</Label>
                    <Select onValueChange={(value) => {
                      const address = savedAddresses.find(a => a.id === value);
                      if (address) applySavedAddress(address, 'from');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose saved address" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {savedAddresses.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            {addr.label} - {addr.city}, {addr.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={fromAddress.name}
                      onChange={(e) => setFromAddress({ ...fromAddress, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Street *</Label>
                    <Input
                      value={fromAddress.street1}
                      onChange={(e) => setFromAddress({ ...fromAddress, street1: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={fromAddress.city}
                      onChange={(e) => setFromAddress({ ...fromAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={fromAddress.state}
                      onChange={(e) => setFromAddress({ ...fromAddress, state: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label>ZIP *</Label>
                    <Input
                      value={fromAddress.zip}
                      onChange={(e) => setFromAddress({ ...fromAddress, zip: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>To Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && !showManualToAddress ? (
                  <div className="relative" ref={searchRef}>
                    <Label htmlFor="toAddressSearchInput">Search Saved Addresses</Label>
                    <Input
                      id="toAddressSearchInput"
                      placeholder="Start typing a name or label..."
                      value={toAddressSearch}
                      onChange={(e) => {
                        setToAddressSearch(e.target.value);
                        setShowToAddressResults(true);
                      }}
                      onFocus={() => setShowToAddressResults(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowToAddressResults(false);
                          e.currentTarget.blur();
                        }
                      }}
                      autoComplete="off"
                    />

                    {showToAddressResults && toAddressSearch.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredToAddresses.length > 0 ? (
                          filteredToAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => applySavedAddress(addr, 'to')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <div className="font-semibold text-gray-900">{addr.label || addr.recipient_name}</div>
                              <div className="text-sm text-gray-600">{addr.recipient_name}</div>
                              <div className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zip_code}</div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-gray-600 mb-3">No saved address found for "{toAddressSearch}"</p>
                            <Button
                              onClick={handleAddNewToAddress}
                              size="sm"
                              className="bg-blue-900 hover:bg-blue-800"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Address Manually
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {filteredToAddresses.length > 0 && showToAddressResults && toAddressSearch.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleAddNewToAddress}
                        className="mt-2 w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Enter a new address manually
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={toAddress.country}
                        onValueChange={(value) => setToAddress({ ...toAddress, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="IT">Italy</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                          <SelectItem value="NL">Netherlands</SelectItem>
                          <SelectItem value="BE">Belgium</SelectItem>
                          <SelectItem value="CH">Switzerland</SelectItem>
                          <SelectItem value="AT">Austria</SelectItem>
                          <SelectItem value="SE">Sweden</SelectItem>
                          <SelectItem value="NO">Norway</SelectItem>
                          <SelectItem value="DK">Denmark</SelectItem>
                          <SelectItem value="FI">Finland</SelectItem>
                          <SelectItem value="PL">Poland</SelectItem>
                          <SelectItem value="IE">Ireland</SelectItem>
                          <SelectItem value="PT">Portugal</SelectItem>
                          <SelectItem value="GR">Greece</SelectItem>
                          <SelectItem value="CZ">Czech Republic</SelectItem>
                          <SelectItem value="HU">Hungary</SelectItem>
                          <SelectItem value="RO">Romania</SelectItem>
                          <SelectItem value="JP">Japan</SelectItem>
                          <SelectItem value="KR">South Korea</SelectItem>
                          <SelectItem value="CN">China</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="SG">Singapore</SelectItem>
                          <SelectItem value="HK">Hong Kong</SelectItem>
                          <SelectItem value="TW">Taiwan</SelectItem>
                          <SelectItem value="MY">Malaysia</SelectItem>
                          <SelectItem value="TH">Thailand</SelectItem>
                          <SelectItem value="PH">Philippines</SelectItem>
                          <SelectItem value="ID">Indonesia</SelectItem>
                          <SelectItem value="VN">Vietnam</SelectItem>
                          <SelectItem value="NZ">New Zealand</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="AR">Argentina</SelectItem>
                          <SelectItem value="CL">Chile</SelectItem>
                          <SelectItem value="CO">Colombia</SelectItem>
                          <SelectItem value="PE">Peru</SelectItem>
                          <SelectItem value="ZA">South Africa</SelectItem>
                          <SelectItem value="IL">Israel</SelectItem>
                          <SelectItem value="AE">United Arab Emirates</SelectItem>
                          <SelectItem value="SA">Saudi Arabia</SelectItem>
                          <SelectItem value="TR">Turkey</SelectItem>
                          <SelectItem value="RU">Russia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Recipient Name *</Label>
                        <Input
                          value={toAddress.name}
                          onChange={(e) => setToAddress({ ...toAddress, name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={toAddress.phone}
                          onChange={(e) => setToAddress({ ...toAddress, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Street Address *</Label>
                        <Input
                          value={toAddress.street1}
                          onChange={(e) => setToAddress({ ...toAddress, street1: e.target.value })}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apartment, Suite, Unit, etc.</Label>
                        <Input
                          value={toAddress.street2}
                          onChange={(e) => setToAddress({ ...toAddress, street2: e.target.value })}
                          placeholder="Apt 123, Suite 456, etc."
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Input
                            value={toAddress.city}
                            onChange={(e) => setToAddress({ ...toAddress, city: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{toAddress.country === 'US' ? 'State *' : 'State/Province'}</Label>
                          <Input
                            value={toAddress.state}
                            onChange={(e) => setToAddress({ ...toAddress, state: e.target.value })}
                            placeholder={toAddress.country === 'US' ? 'TX' : 'State/Province'}
                            maxLength={toAddress.country === 'US' ? 2 : 50}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{toAddress.country === 'US' ? 'ZIP Code *' : 'Postal Code *'}</Label>
                          <Input
                            value={toAddress.zip}
                            onChange={(e) => setToAddress({ ...toAddress, zip: e.target.value })}
                            placeholder={toAddress.country === 'US' ? '78258' : 'Postal code'}
                          />
                        </div>
                      </div>
                    </div>

                    {savedAddresses.length > 0 && showManualToAddress && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowManualToAddress(false);
                          setToAddressSearch("");
                          setToAddress({
                            name: "",
                            street1: "",
                            street2: "",
                            city: "",
                            state: "",
                            zip: "",
                            country: "US",
                            phone: ""
                          });
                        }}
                      >
                        ← Back to Search
                      </Button>
                    )}
                    {savedAddresses.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">You have no saved addresses. Please enter recipient details manually.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Length (in) *</Label>
                    <Input
                      type="number"
                      value={parcel.length}
                      onChange={(e) => setParcel({ ...parcel, length: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Width (in) *</Label>
                    <Input
                      type="number"
                      value={parcel.width}
                      onChange={(e) => setParcel({ ...parcel, width: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Height (in) *</Label>
                    <Input
                      type="number"
                      value={parcel.height}
                      onChange={(e) => setParcel({ ...parcel, height: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Weight (lbs) *</Label>
                    <Input
                      type="number"
                      value={parcel.weight}
                      onChange={(e) => setParcel({ ...parcel, weight: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Ounces (oz)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      value={parcel.weight_oz}
                      onChange={(e) => setParcel({ ...parcel, weight_oz: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="bg-blue-50 p-3 rounded-lg w-full">
                      <p className="text-xs text-gray-600 mb-1">Total Weight</p>
                      <p className="text-lg font-bold text-blue-900">{calculateTotalWeight().toFixed(2)} lbs</p>
                    </div>
                  </div>
                </div>

                {/* Removed NEW: Media Mail Checkbox */}
              </CardContent>
            </Card>

            {/* Removed NEW: Media Mail Warning Dialog */}

            <Button
              onClick={handleGetRates}
              disabled={loading || validating}
              className="w-full bg-blue-900 hover:bg-blue-800 py-6 text-lg"
            >
              {loading || validating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {validating ? 'Validating...' : 'Getting Rates...'}
                </>
              ) : (
                <>
                  Get Shipping Rates
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Select Shipping Service</CardTitle>
                <CardDescription>
                  {rates?.length || 0} service options available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <RadioGroup value={selectedRate?.rate_id} onValueChange={(value) => {
                  const rate = rates.find(r => r.rate_id === value);
                  setSelectedRate(rate);
                }}>
                  {/* Best Value by Carrier */}
                  {bestValueByCarrier.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        💰 Best Value by Carrier
                      </h3>
                      <div className="space-y-3">
                        {bestValueByCarrier.map((rate) => (
                          <label
                            key={rate.rate_id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedRate?.rate_id === rate.rate_id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <RadioGroupItem value={rate.rate_id} />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {rate.carrier === 'USPS' && '📮 '}
                                  {rate.carrier === 'UPS' && '📦 '}
                                  {rate.carrier === 'FedEx' && '🚚 '}
                                  {rate.carrier} - {rate.service_level}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {rate.estimated_days ? `${rate.estimated_days} business days` : rate.duration_terms || 'See carrier for details'}
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">${rate.amount.toFixed(2)}</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fastest by Carrier */}
                  {fastestByCarrier.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        ⚡ Fastest by Carrier
                      </h3>
                      <div className="space-y-3">
                        {fastestByCarrier.map((rate) => (
                          <label
                            key={rate.rate_id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedRate?.rate_id === rate.rate_id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <RadioGroupItem value={rate.rate_id} />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {rate.carrier === 'USPS' && '📮 '}
                                  {rate.carrier === 'UPS' && '📦 '}
                                  {rate.carrier === 'FedEx' && '🚚 '}
                                  {rate.carrier} - {rate.service_level}
                                </div>
                                <div className="text-sm text-green-600 font-semibold">
                                  {rate.estimated_days} business day{rate.estimated_days !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">${rate.amount.toFixed(2)}</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Value - Guaranteed Delivery */}
                  {bestValueGuaranteed.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Best Value - Guaranteed Delivery
                      </h3>
                      <div className="space-y-3">
                        {bestValueGuaranteed.slice(0, 5).map((rate) => (
                          <label
                            key={rate.rate_id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedRate?.rate_id === rate.rate_id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <RadioGroupItem value={rate.rate_id} />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {rate.carrier === 'USPS' && '📮 '}
                                  {rate.carrier === 'UPS' && '📦 '}
                                  {rate.carrier === 'FedEx' && '🚚 '}
                                  {rate.carrier} - {rate.service_level} - Guaranteed
                                </div>
                                <div className="text-sm text-blue-600 font-semibold">
                                  Guaranteed {rate.estimated_days} business day{rate.estimated_days !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">${rate.amount.toFixed(2)}</div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Options by Carrier */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">All Options by Carrier</h3>
                    <div className="space-y-6">
                      {Object.entries(groupedRates).map(([carrier, carrierRates]) => (
                        <div key={carrier}>
                          <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                            {carrier === 'USPS' && '📮'}
                            {carrier === 'UPS' && '📦'}
                            {carrier === 'FedEx' && '🚚'}
                            {carrier}
                          </h4>
                          <div className="space-y-3">
                            {carrierRates.map((rate) => (
                              <label
                                key={rate.rate_id}
                                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedRate?.rate_id === rate.rate_id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <RadioGroupItem value={rate.rate_id} />
                                  <div>
                                    <div className="font-semibold text-gray-900">{rate.service_level}</div>
                                    <div className="text-sm text-gray-600">
                                      {rate.estimated_days ? `${rate.estimated_days} business days` : rate.duration_terms || 'See carrier for details'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">${rate.amount.toFixed(2)}</div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {selectedRate && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Print Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={printLocation} onValueChange={setPrintLocation}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label htmlFor="home" className={`p-4 border-2 rounded-lg cursor-pointer flex items-center ${
                        printLocation === 'home' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <RadioGroupItem value="home" id="home" className="mr-2"/>
                        <Label htmlFor="home" className="cursor-pointer">Print at Home</Label>
                      </label>
                      <label htmlFor="store" className={`p-4 border-2 rounded-lg cursor-pointer flex items-center ${
                        printLocation === 'store' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <RadioGroupItem value="store" id="store" className="mr-2"/>
                        <Label htmlFor="store" className="cursor-pointer">Print at Store</Label>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={!selectedRate || purchasing}
                className="flex-1 bg-blue-900 hover:bg-blue-800 py-6 text-lg"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : printLocation === 'store' ? (
                  <>
                    <Store className="w-5 h-5 mr-2" />
                    Save for In-Store
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ${selectedRate?.amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
