import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Mail, Truck, FileCheck, Printer, Shirt, Calculator, ArrowRight } from "lucide-react";

const categoryIcons = {
  mailbox: Mail,
  uhaul: Truck,
  notary: FileCheck,
  printing: Printer,
  apparel: Shirt,
  shipping: Calculator
};

const categoryColors = {
  mailbox: "from-blue-500 to-blue-600",
  uhaul: "from-orange-500 to-orange-600",
  notary: "from-green-500 to-green-600",
  printing: "from-purple-500 to-purple-600",
  apparel: "from-pink-500 to-pink-600",
  shipping: "from-indigo-500 to-indigo-600"
};

export default function Services() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await base44.entities.Service.list();
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    initialData: [],
  });

  const groupedServices = (services || []).reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive business solutions tailored for Stone Oak and San Antonio area businesses
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedServices).map(([category, categoryServices]) => {
                const Icon = categoryIcons[category] || Mail;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[category]} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 capitalize">
                        {category.replace('_', ' ')} Services
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryServices.map((service) => (
                        <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                          <CardHeader>
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                            {service.price && (
                              <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700">
                                {service.price}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 leading-relaxed">{service.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && services.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Services Coming Soon</h3>
              <p className="text-gray-600 mb-8">We're setting up our service catalog. Check back soon!</p>
            </div>
          )}

          <div className="mt-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect solution for your business needs.
            </p>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg">
                Contact Us Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}