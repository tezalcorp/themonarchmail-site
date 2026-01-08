import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Package, AlertCircle, RefreshCw } from "lucide-react";

export default function TestShippo() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('testShippoConnection');
      console.log("Full response:", response);
      setResult(response.data);
    } catch (error) {
      console.error("Error details:", error);
      setResult({
        success: false,
        error: error.message || "Failed to test connection",
        details: error.response?.data
      });
    }
    
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-3">
              <Package className="w-6 h-6" />
              Shippo Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-6">
                Test your Shippo API connection and check active carriers
              </p>
              <Button
                onClick={testConnection}
                disabled={testing}
                className="bg-blue-900 hover:bg-blue-800"
                size="lg"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Test Shippo Connection
                  </>
                )}
              </Button>
            </div>

            {result && (
              <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.success ? "✓ Shippo API Connected!" : "✗ Connection Failed"}
                    </h3>
                    
                    {result.error && (
                      <div className="mb-4">
                        <p className="text-red-700 font-semibold mb-2">Error:</p>
                        <p className="text-red-600 text-sm bg-red-100 p-3 rounded">{result.error}</p>
                      </div>
                    )}

                    {result.success && (
                      <>
                        <div className="mb-6">
                          <p className="text-sm text-gray-600 mb-2">
                            Total carrier accounts found (all pages): <strong>{result.total_carriers}</strong>
                          </p>
                        </div>

                        {result.has_active_us_carriers ? (
                          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-green-900 mb-2">
                                  ✓ Ready to Ship! Active US Carriers Detected
                                </p>
                                {result.active_us_carriers && result.active_us_carriers.length > 0 && (
                                  <div className="space-y-2 mt-3">
                                    {result.active_us_carriers.map((carrier) => (
                                      <div key={carrier.carrier} className="bg-white p-3 rounded border border-green-200">
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold text-gray-900">{carrier.carrier}</span>
                                          <Badge className="bg-green-600 text-white">
                                            {carrier.active_accounts} of {carrier.account_count} active
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-orange-900 mb-2">
                                  No Active US Carriers Found
                                </p>
                                <p className="text-sm text-orange-800 mb-3">
                                  You need to activate at least one US carrier (USPS, UPS, or FedEx) in your Shippo account.
                                </p>
                                <a 
                                  href="https://apps.goshippo.com/settings/carriers"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
                                >
                                  Activate Carriers in Shippo →
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {result.us_carriers_summary && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                              View Detailed Carrier Breakdown
                            </summary>
                            <div className="mt-3 space-y-3">
                              {Object.entries(result.us_carriers_summary).map(([carrier, data]) => (
                                <div key={carrier} className="bg-white p-4 rounded border">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900 uppercase">{carrier}</span>
                                    <Badge variant={data.anyActive ? "default" : "secondary"}>
                                      {data.anyActive ? "Has Active Account" : "All Inactive"}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    {data.rows.map((row, idx) => (
                                      <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                        <span>
                                          {row.shippo && "🔹 "}
                                          {row.description || row.id}
                                        </span>
                                        <span className={row.active ? "text-green-600 font-semibold" : "text-gray-400"}>
                                          {row.active ? "✓ Active" : "Inactive"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}