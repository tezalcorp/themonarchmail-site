
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Mail, Truck, FileCheck, Shirt, Calculator, ArrowRight, CheckCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const services = [
    {
      icon: Mail,
      title: "Mailbox Rentals",
      description: "Physical and virtual mailbox solutions for your business",
      color: "from-blue-500 to-blue-600",
      link: createPageUrl("ReserveMailbox")
    },
    {
      icon: Truck,
      title: "U-Haul Rentals",
      description: "Convenient truck and trailer rentals for moving",
      color: "from-orange-500 to-orange-600",
      link: createPageUrl("UHaulRentals")
    },
    {
      icon: FileCheck,
      title: "Notary Services",
      description: "Professional notary public services available",
      color: "from-green-500 to-green-600",
      link: null
    },
    {
      icon: Package,
      title: "Printing & Business Cards",
      description: "High-quality printing for all your business needs",
      color: "from-purple-500 to-purple-600",
      link: null
    },
    {
      icon: Shirt,
      title: "Custom Apparel",
      description: "Branded clothing and promotional items",
      color: "from-pink-500 to-pink-600",
      link: null
    },
    {
      icon: Calculator,
      title: "Shipping Comparison",
      description: "Compare rates across all major carriers",
      color: "from-indigo-500 to-indigo-600",
      link: createPageUrl("ShippingCalculator")
    }
  ];

  const benefits = [
    "Compare shipping costs across USPS, UPS, and FedEx",
    "Local Stone Oak business with personalized service",
    "One-stop shop for all business solutions",
    "Convenient location in San Antonio"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Complete Business
              <br />
              <span className="text-orange-400">Solutions Partner</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Serving Stone Oak & San Antonio with mailbox rentals, shipping, printing, and more
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl("ReserveMailbox")}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                  <Mail className="w-5 h-5 mr-2" />
                  Reserve a Mailbox
                </Button>
              </Link>
              <Link to={createPageUrl("ShippingCalculator")}>
                <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg">
                  <Calculator className="w-5 h-5 mr-2" />
                  Compare Shipping Rates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mailbox CTA Banner */}
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Need a Professional Business Address?
              </h2>
              <p className="text-orange-50 text-lg">
                Reserve your mailbox today - Physical & Virtual options available
              </p>
            </div>
            <Link to={createPageUrl("ReserveMailbox")}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 shadow-xl px-8 py-6 text-lg font-bold whitespace-nowrap hover:scale-105 transition-all">
                <Mail className="w-5 h-5 mr-2" />
                Reserve Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Unique Value Proposition */}
      <section className="py-12 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Our Unique Advantage
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare All Major Carriers in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Save time and money with our exclusive shipping comparison tool. Get instant quotes from USPS, UPS, and FedEx to find the best rates for your packages.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything your business needs under one roof
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {service.link ? (
                  <Link to={service.link}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
                      <CardContent className="p-8">
                        <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl("Services")}>
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white">
                Explore All Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Stone Oak Businesses Choose Us
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're more than just a service provider - we're your local business partner committed to your success.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to={createPageUrl("Contact")}>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-orange-100 p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
                  alt="Professional business services"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Visit us in Stone Oak or get in touch to learn how we can help your business thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("ReserveMailbox")}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg shadow-xl">
                <Mail className="w-5 h-5 mr-2" />
                Reserve a Mailbox
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-6 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
