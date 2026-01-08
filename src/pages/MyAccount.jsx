
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Plus, Trash2, Edit, CheckCircle, LogOut, Package, Clock, Download, Store, AlertCircle, FileCheck } from "lucide-react"; // Added FileCheck
import { motion, AnimatePresence } from "framer-motion";

export default function MyAccount() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentCancelled, setShowPaymentCancelled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus === 'success') {
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 5000);
      // Clean up URL
      window.history.replaceState({}, '', '/MyAccount');
    } else if (paymentStatus === 'cancelled') {
      setShowPaymentCancelled(true);
      setTimeout(() => setShowPaymentCancelled(false), 5000);
      // Clean up URL
      window.history.replaceState({}, '', '/MyAccount');
    }
  }, []);

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
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login or create an account to access your account page</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-blue-900 hover:bg-blue-800"
            >
              Login / Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only render the full account page if authenticated
  return <AuthenticatedMyAccount showPaymentSuccess={showPaymentSuccess} showPaymentCancelled={showPaymentCancelled} />;
}

function AuthenticatedMyAccount({ showPaymentSuccess, showPaymentCancelled }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [addressData, setAddressData] = useState({
    label: "",
    recipient_name: "",
    company: "",
    street_address: "",
    street_address_2: "",
    city: "",
    state: "",
    zip_code: "",
    phone: ""
  });
  const [saved, setSaved] = useState(false);
  // Removed isAuthenticated state as it's handled by parent MyAccount

  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      setProfileData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        business_name: userData.business_name || "",
        street_address: userData.street_address || "",
        street_address_2: userData.street_address_2 || "",
        city: userData.city || "",
        state: userData.state || "",
        zip_code: userData.zip_code || ""
      });
      return userData;
    },
    // The `enabled` prop logic for this query needs to ensure `isAuthenticated` is true.
    // Since this component is only rendered if `isAuthenticated` is true, we don't need
    // to explicitly pass it here, but rather rely on the parent component's logic.
    retry: false
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['savedAddresses'],
    queryFn: async () => {
      try {
        const result = await base44.entities.SavedAddress.filter({ created_by: user?.email }, '-times_used');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user,
    initialData: []
  });

  const { data: shippingLabels = [] } = useQuery({
    queryKey: ['shippingLabels'],
    queryFn: async () => {
      try {
        console.log("Fetching labels for user:", user?.email);
        const result = await base44.entities.ShippingLabel.filter({ user_email: user?.email }, '-created_date');
        console.log("Labels fetched:", result);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Error fetching labels:", error);
        return [];
      }
    },
    enabled: !!user,
    initialData: []
  });

  const { data: pendingShipments = [] } = useQuery({
    queryKey: ['pendingShipments'],
    queryFn: async () => {
      try {
        const result = await base44.entities.PendingShipment.filter({ created_by: user?.email }, '-created_date');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user,
    initialData: []
  });

  const { data: mailboxReservation } = useQuery({
    queryKey: ['mailboxReservation'],
    queryFn: async () => {
      try {
        // This is a placeholder; adjust the filter criteria as per your actual backend logic
        // For example, you might look for a reservation by user ID or email, and ensure it's active.
        const result = await base44.entities.MailboxReservation.filter({ user_email: user?.email, status: 'active' });
        return result.length > 0 ? result[0] : null; // Assuming one active reservation per user
      } catch (error) {
        console.error("Error fetching mailbox reservation:", error);
        return null;
      }
    },
    enabled: !!user,
    initialData: null,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setEditingProfile(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const createAddressMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedAddress.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
      setShowAddressForm(false);
      resetAddressForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedAddress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
      setEditingAddress(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedAddress.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAddresses'] });
    }
  });

  const resetAddressForm = () => {
    setAddressData({
      label: "",
      recipient_name: "",
      company: "",
      street_address: "",
      street_address_2: "",
      city: "",
      state: "",
      zip_code: "",
      phone: ""
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const { email, ...dataToUpdate } = profileData;
    updateProfileMutation.mutate(dataToUpdate);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: addressData });
    } else {
      createAddressMutation.mutate(addressData);
    }
  };

  const startEditingAddress = (address) => {
    setAddressData(address);
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddressForm();
  };

  const downloadUSPSForm = async (reservationId) => {
    try {
      // Assuming base44.functions.invoke correctly handles binary responses
      const response = await base44.functions.invoke('generateUSPSForm1583', {
        reservation_id: reservationId
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `USPS_Form_1583_${reservationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading USPS form:', error);
      alert('Error downloading form. Please try again.');
    }
  };

  // Show loading while fetching user data
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show error if user data failed to load
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Account</h2>
            <p className="text-gray-600 mb-6">Unable to load your account information. Please try logging in again.</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-blue-900 hover:bg-blue-800"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and shipping information</p>
          </div>
          <Button variant="outline" onClick={() => base44.auth.logout()} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Payment Success Banner */}
        {showPaymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">Payment Successful!</h3>
                <p className="text-green-700">Your label will appear below in 2-3 minutes. Check your email for confirmation.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Cancelled Banner */}
        {showPaymentCancelled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-bold text-orange-900">Payment Cancelled</h3>
                <p className="text-orange-700">No charges were made. Create a new shipment when you're ready.</p>
              </div>
            </div>
          </motion.div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Changes saved successfully!</span>
          </motion.div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" />
              Addresses ({addresses.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingShipments.length})
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-2">
              <Package className="w-4 h-4" />
              Labels ({shippingLabels.length})
            </TabsTrigger>
            <TabsTrigger value="mailbox" className="gap-2">
              <Store className="w-4 h-4" />
              Mailbox {mailboxReservation ? "(1)" : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                  </div>
                  {!editingProfile && (
                    <Button onClick={() => setEditingProfile(true)} variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed (login credential)</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={profileData.business_name}
                        onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Mailing Address</h3>
                    <div className="space-y-2">
                      <Label htmlFor="street_address">Street Address</Label>
                      <Input
                        id="street_address"
                        value={profileData.street_address}
                        onChange={(e) => setProfileData({ ...profileData, street_address: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street_address_2">Apt, Suite, etc.</Label>
                      <Input
                        id="street_address_2"
                        value={profileData.street_address_2}
                        onChange={(e) => setProfileData({ ...profileData, street_address_2: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profileData.state}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          value={profileData.zip_code}
                          onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
                          disabled={!editingProfile}
                        />
                      </div>
                    </div>
                  </div>

                  {editingProfile && (
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            {!showAddressForm && (
              <Button onClick={() => setShowAddressForm(true)} className="bg-blue-900 hover:bg-blue-800 gap-2">
                <Plus className="w-4 h-4" />
                Add New Address
              </Button>
            )}

            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle>{editingAddress ? "Edit Address" : "Add New Address"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handleAddressSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="label">Label *</Label>
                            <Input
                              id="label"
                              value={addressData.label}
                              onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
                              placeholder="e.g., Mom, Office"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient_name">Recipient Name *</Label>
                            <Input
                              id="recipient_name"
                              value={addressData.recipient_name}
                              onChange={(e) => setAddressData({ ...addressData, recipient_name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={addressData.company}
                            onChange={(e) => setAddressData({ ...addressData, company: e.target.value })}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="address_street">Street Address *</Label>
                            <Input
                              id="address_street"
                              value={addressData.street_address}
                              onChange={(e) => setAddressData({ ...addressData, street_address: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address_street_2">Apt, Suite, etc.</Label>
                            <Input
                              id="address_street_2"
                              value={addressData.street_address_2}
                              onChange={(e) => setAddressData({ ...addressData, street_address_2: e.target.value })}
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="address_city">City *</Label>
                              <Input
                                id="address_city"
                                value={addressData.city}
                                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address_state">State *</Label>
                              <Input
                                id="address_state"
                                value={addressData.state}
                                onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address_zip">ZIP *</Label>
                              <Input
                                id="address_zip"
                                value={addressData.zip_code}
                                onChange={(e) => setAddressData({ ...addressData, zip_code: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address_phone">Phone</Label>
                          <Input
                            id="address_phone"
                            type="tel"
                            value={addressData.phone}
                            onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                            {editingAddress ? "Update" : "Save"} Address
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelAddressForm}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{address.label}</h3>
                          {address.times_used > 0 && (
                            <p className="text-sm text-gray-500">Used {address.times_used} times</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingAddress(address)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAddressMutation.mutate(address.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-gray-700 space-y-1">
                        <p className="font-medium">{address.recipient_name}</p>
                        {address.company && <p>{address.company}</p>}
                        <p>{address.street_address}</p>
                        {address.street_address_2 && <p>{address.street_address_2}</p>}
                        <p>{address.city}, {address.state} {address.zip_code}</p>
                        {address.phone && <p>{address.phone}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Addresses</h3>
                  <p className="text-gray-600 mb-6">Save addresses for quick shipping</p>
                  <Button onClick={() => setShowAddressForm(true)} className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingShipments.length > 0 ? (
              <div className="space-y-4">
                {pendingShipments.map((shipment) => (
                  <Card key={shipment.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge className="bg-orange-100 text-orange-800 mb-3">Pending Validation</Badge>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>To:</strong> {shipment.to_address?.name}, {shipment.to_address?.city}, {shipment.to_address?.state}</p>
                            <p><strong>Service:</strong> {shipment.selected_rate?.service_level}</p>
                            <p><strong>Package:</strong> {shipment.parcel?.length}" × {shipment.parcel?.width}" × {shipment.parcel?.height}", {shipment.parcel?.weight} lbs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            ${shipment.selected_rate?.amount?.toFixed(2)}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Store className="w-3 h-3 mr-1" />
                            Visit Store
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Shipments</h3>
                  <p className="text-gray-600">Create a shipment to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="labels">
            {shippingLabels.length > 0 ? (
              <div className="space-y-4">
                {shippingLabels.map((label) => (
                  <Card key={label.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-blue-100 text-blue-800">{label.carrier}</Badge>
                            <Badge variant="outline">{label.service_level}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Tracking:</strong> {label.tracking_number}</p>
                            <p><strong>To:</strong> {label.to_address?.name}</p>
                            <p><strong>Date:</strong> {new Date(label.created_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-3">
                            ${label.rate?.toFixed(2)}
                          </div>
                          {label.label_url && (
                            <a href={label.label_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Labels Yet</h3>
                  <p className="text-gray-600">Purchase your first shipping label</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mailbox">
            {mailboxReservation ? (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Mailbox Reservation</span>
                    {mailboxReservation.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                    {mailboxReservation.status === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </Badge>
                    )}
                    {mailboxReservation.status === 'denied' && (
                      <Badge className="bg-red-100 text-red-800">
                        Denied
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">{mailboxReservation.mailbox_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-semibold capitalize">{mailboxReservation.preferred_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-semibold capitalize">{mailboxReservation.payment_status}</span>
                    </div>
                    {mailboxReservation.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-semibold">{new Date(mailboxReservation.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Download USPS Form Button */}
                    <div className="pt-4 border-t mt-4">
                      {mailboxReservation.status === 'approved' && (
                        <Button 
                          onClick={() => downloadUSPSForm(mailboxReservation.id)}
                          variant="outline" 
                          className="w-full"
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Download USPS Form 1583
                        </Button>
                      )}
                      {mailboxReservation.status === 'pending' && (
                        <p className="text-sm text-gray-500 text-center">
                          USPS Form 1583 will be available for download once your reservation is approved.
                        </p>
                      )}
                      {mailboxReservation.status === 'denied' && (
                        <p className="text-sm text-red-600 text-center">
                          Your mailbox reservation was denied. Please contact support for more information.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mailbox Reservation</h3>
                  <p className="text-gray-600">You don't have an active mailbox reservation. Contact us to set one up!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
