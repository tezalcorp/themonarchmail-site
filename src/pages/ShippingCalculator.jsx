import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Package, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ShippingCalculator() {
  const [formData, setFormData] = useState({
    from_zip: "78258",
    to_zip: "",
    weight: "",
    length: "",
    width: "",
    height: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carriers = [
    { name: "USPS", icon: "📮" },
    { name: "UPS", icon: "📦" },
    { name: "FedEx", icon: "🚚" }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const calculateRates = () => {
    if (!formData.to_zip || !formData.weight) {
      setError("Please enter destination ZIP and weight.");
      return;
    }

    setLoading(true);
    setError(null);

    // Temporary placeholder (NO Base44 calls)
    setTimeout(() => {
      setLoading(false);
      setError(
        "Live rate comparison is temporarily unavailable while we migrate systems. Please visit or call the store for an exact quote."
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Shipping Rate Comparison</h1>
          <p className="text-indigo-100 text-lg">
            Compare USPS, UPS, and FedEx shipping options
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8">
          {/* FORM */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From ZIP</Label>
                  <Input
                    name="from_zip"
                    value={formData.from_zip}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>To ZIP *</Label>
                  <Input
                    name="to_zip"
                    value={formData.to_zip}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label>Weight (lbs) *</Label>
                <Input
                  name="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Dimensions (optional)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Input name="length" placeholder="L" onChange={handleInputChange} />
                  <Input name="width" placeholder="W" onChange={handleInputChange} />
                  <Input name="height" placeholder="H" onChange={handleInputChange} />
                </div>
              </div>

              <Button
                onClick={calculateRates}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2 rounded-full"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    Compare Rates
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl flex items-center justify-center text-center p-8">
              <div>
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Rates Coming Back Soon</h3>
                <p className="text-gray-600 mb-4">
                  We’re upgrading our shipping engine. For now, get exact pricing in-store.
                </p>

                <div className="flex justify-center gap-4">
                  <Link to="/Contact">
                    <Button variant="outline">Contact Us</Button>
                  </Link>
                  <Link to="/CreateShipment">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Create Shipment
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Supported Carriers</h4>
                <div className="flex gap-4 text-xl">
                  {carriers.map(c => (
                    <span key={c.name}>{c.icon} {c.name}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
