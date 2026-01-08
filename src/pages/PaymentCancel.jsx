import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your payment was cancelled. No charges were made to your account.
            </p>

            <Link to={createPageUrl("CreateShipment")}>
              <Button className="bg-blue-900 hover:bg-blue-800 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}