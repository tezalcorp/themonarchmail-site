
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, TrendingDown, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ShippingCalculator() {
  const [formData, setFormData] = useState({
    from_zip: "78258",
    to_zip: "",
    weight: "",
    length: "",
    width: "",
    height: ""
  });
  const [quotes, setQuotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Removed saved state and saveQuote function as they are no longer used

  const carriers = [
    { name: "USPS", icon: "📮", color: "blue" },
    { name: "UPS", icon: "📦", color: "orange" },
    { name: "FedEx", icon: "🚚", color: "purple" }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const calculateRates = async () => {
    if (!formData.to_zip || !formData.weight) {
      setError("Please fill in destination ZIP and weight");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getShippingRates', {
        from_zip: formData.from_zip,
        to_zip: formData.to_zip,
        weight: parseFloat(formData.weight),
        length: formData.length,
        width: formData.width,
        height: formData.height
      });

      if (response.data.success) {
        setQuotes(response.data.rates);
      } else {
        setError(response.data.error || "Failed to get shipping rates");
      }
    } catch (error) {
      console.error("Error calculating rates:", error);
      setError("Unable to calculate rates. Please check your information and try again.");
    }
    
    setLoading(false);
  };

  // Removed saveQuote function as it is no longer used

  const getBestRate = () => {
    if (!quotes) return null;
    const rates = Object.entries(quotes)
      .filter(([carrier, rate]) => rate !== null)
      .map(([carrier, rate]) => ({ carrier, rate }));
    
    if (rates.length === 0) return null;
    return rates.reduce((min, current) => current.rate < min.rate ? current : min);
  };

  const bestRate = getBestRate();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shipping Rate Comparison</h1>
          <p className="text-xl text-indigo-100">
            Compare real-time rates from USPS, UPS, and FedEx instantly
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_zip">From ZIP Code</Label>
                    <Input
                      id="from_zip"
                      name="from_zip"
                      value={formData.from_zip}
                      onChange={handleInputChange}
                      placeholder="78258"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to_zip">To ZIP Code *</Label>
                    <Input
                      id="to_zip"
                      name="to_zip"
                      value={formData.to_zip}
                      onChange={handleInputChange}
                      placeholder="90210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Dimensions (inches) - Optional</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      name="length"
                      type="number"
                      value={formData.length}
                      onChange={handleInputChange}
                      placeholder="L"
                    />
                    <Input
                      name="width"
                      type="number"
                      value={formData.width}
                      onChange={handleInputChange}
                      placeholder="W"
                    />
                    <Input
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="H"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    If not provided, we'll use default dimensions
                  </p>
                </div>

                <Button
                  onClick={calculateRates}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Getting Live Rates...
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

            <div className="space-y-6">
              {!quotes ? (
                <Card className="border-0 shadow-xl h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingDown className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Compare?</h3>
                    <p className="text-gray-600">
                      Enter your package details and we'll show you real-time rates from all major carriers
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {bestRate && (
                    <Card className="border-2 border-green-500 bg-green-50 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Best Rate - Save Money!</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-green-900 uppercase">
                            {bestRate.carrier}
                          </span>
                          <span className="text-3xl font-bold text-green-900">
                            ${bestRate.rate.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {carriers.map((carrier) => {
                    const rate = quotes[carrier.name.toLowerCase()];
                    const isBest = bestRate && carrier.name.toLowerCase() === bestRate.carrier.toLowerCase();
                    
                    if (rate === null) {
                      return (
                        <Card key={carrier.name} className="border-0 shadow-lg bg-gray-50">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl opacity-50">{carrier.icon}</span>
                                <span className="text-xl font-bold text-gray-400">{carrier.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">Not available</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    
                    return (
                      <Card key={carrier.name} className={`border-0 shadow-lg ${isBest ? 'opacity-50' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{carrier.icon}</span>
                              <span className="text-xl font-bold text-gray-900">{carrier.name}</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              ${rate.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-center text-white">
                    <h3 className="text-lg font-semibold mb-2">Want Full Shipping Options?</h3>
                    <p className="text-blue-100 mb-4">
                      Create an account or log in to access all carriers, save addresses, and purchase labels
                    </p>
                    <Button
                      onClick={() => base44.auth.redirectToLogin('/CreateShipment')}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Create Account / Login
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-12 bg-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Compare with Monarch Mail?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 mb-1">Real-Time Rates</h4>
                <p className="text-gray-600 text-sm">Live pricing directly from carriers via Shippo</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💰</div>
                <h4 className="font-semibold text-gray-900 mb-1">Guaranteed Savings</h4>
                <p className="text-gray-600 text-sm">Find the absolute best rate for every shipment</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-gray-900 mb-1">Major Carriers</h4>
                <p className="text-gray-600 text-sm">Compare USPS, UPS, and FedEx at once</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
