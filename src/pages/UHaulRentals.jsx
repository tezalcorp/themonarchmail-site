
import React from "react";
import { Truck, MapPin, Phone, ExternalLink, Clock, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UHaulRentals() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Truck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">U-Haul Rentals</h1>
          </div>
          <p className="text-xl text-blue-100 text-center max-w-3xl mx-auto mb-8">
            Reserve trucks, trailers, and moving equipment at our Stone Oak location
          </p>
          <div className="flex justify-center">
            <a
              href="https://www.uhaul.com/Locations/Truck-Rentals-near-San-Antonio-TX-78258/047515/?utm_source=gmb&utm_medium=primary&utm_campaign=uhaulsmlm&utm_content=047515"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl px-8 py-6 text-lg">
                Reserve Now on U-Haul.com
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trucks & Vans</h3>
                <p className="text-gray-600">
                  From 10' to 26' trucks, cargo vans, and pickup trucks for any moving need
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Boxes className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trailers & Towing</h3>
                <p className="text-gray-600">
                  Utility trailers, car trailers, and towing equipment available
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Rental</h3>
                <p className="text-gray-600">
                  Daily, weekly, or monthly rentals with 24/7 roadside assistance
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Location</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Monarch Mail at Stone Oak</p>
                      <p className="text-gray-600">20711 Wilderness Oak Ste 107</p>
                      <p className="text-gray-600">San Antonio, TX 78258</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Call Us</p>
                      <p className="text-gray-600">(210) 265-5805</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Hours</p>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 3:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Reserve</h2>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Click "Reserve Now"</p>
                      <p className="text-gray-600 text-sm">Button above takes you to U-Haul's reservation system</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Select Your Equipment</p>
                      <p className="text-gray-600 text-sm">Choose the truck, van, or trailer size you need</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pick Up at Our Location</p>
                      <p className="text-gray-600 text-sm">Come to our Stone Oak store to pick up your rental</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Reserve?</h2>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              Get instant pricing and availability on U-Haul's website
            </p>
            <a
              href="https://www.uhaul.com/Locations/Truck-Rentals-near-San-Antonio-TX-78258/047515/?utm_source=gmb&utm_medium=primary&utm_campaign=uhaulsmlm&utm_content=047515"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl px-8 py-6 text-lg">
                Reserve Now on U-Haul.com
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <p className="text-sm text-blue-200 mt-4">
              Questions? Call us at (210) 265-5805
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
