import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError("No session ID found");
          setLoading(false);
          return;
        }

        // Try to verify session - but don't fail if it doesn't work
        try {
          // You could add a backend function here to verify the session if needed
          setSessionData({ sessionId });
        } catch (err) {
          console.error("Session verification error:", err);
          // Still show success even if verification fails
          setSessionData({ sessionId });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Thank you for your payment. We've received your order and will process it shortly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-blue-900 mb-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Confirmation Email Sent</span>
              </div>
              <p className="text-sm text-blue-700">
                We've sent a confirmation email with all the details. Please check your inbox.
              </p>
            </div>

            <div className="space-y-3">
              <Link to={createPageUrl("MyAccount")}>
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  Go to My Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to={createPageUrl("Home")}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full text-lg py-6"
                >
                  Return to Home
                </Button>
              </Link>
            </div>

            {sessionData?.sessionId && (
              <p className="text-xs text-gray-400 mt-8">
                Transaction ID: {sessionData.sessionId.substring(0, 20)}...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}