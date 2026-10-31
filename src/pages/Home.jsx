import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Heart, Mail } from "lucide-react";
import { motion } from "framer-motion";

const HOURS = [
  { label: "Monday – Friday", value: "10:00 AM – 5:30 PM", note: "through Wednesday, November 25" },
  { label: "Saturday", value: "By appointment", note: "through November 25" },
  { label: "Sunday", value: "Closed", note: "" },
  { label: "Thursday, November 26", value: "Closed", note: "Thanksgiving" },
  { label: "Fri Nov 27 – Mon Nov 30", value: "Sale only", note: "remaining inventory & fixtures, 10:00 AM – 5:30 PM or by appointment" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-orange-300">Monarch Mail · Stone Oak</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Thank you<br />
              <span className="text-orange-400">Stone Oak & San Antonio</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100 sm:text-xl">
              Our storefront is closing after <strong className="text-white">Wednesday, November 25, 2026</strong>.
              Thank you for two and a half years of trust, friendship, and good conversation.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={createPageUrl("FAQ")}>
                <Button size="lg" className="bg-orange-500 px-8 py-6 text-lg text-white shadow-xl hover:bg-orange-600">
                  Read the Closing FAQ
                </Button>
              </Link>
              <Link to={createPageUrl("WhatsNext")}>
                <Button size="lg" className="border-2 border-white/30 bg-white/10 px-8 py-6 text-lg text-white backdrop-blur-sm hover:bg-white/20">
                  What's Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Thank you */}
      <section className="bg-orange-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Heart className="mx-auto mb-6 h-10 w-10 text-orange-500" />
          <h2 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">To our neighbors</h2>
          <p className="text-lg leading-relaxed text-gray-700 sm:text-xl">
            Thank you to all of our neighbors who have supported us through shipping, retail, T-shirt printing, business cards and
            marketing material printing, all of the pizza, donuts, homemade cookies, venison, book donations, and the memorable
            conversations.
          </p>
          <p className="mt-8 text-lg font-medium italic leading-relaxed text-blue-900 sm:text-xl">
            We are grateful to have been a part of each other's stories during this season.
          </p>
        </div>
      </section>

      {/* Hours */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <Clock className="mx-auto mb-4 h-8 w-8 text-blue-900" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Hours of Operation</h2>
            <p className="mt-3 text-gray-600">Stone Oak · 20711 Wilderness Oak Ste 107, San Antonio, TX 78258</p>
          </div>
          <dl className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {HOURS.map((row) => (
              <div key={row.label} className="grid gap-1 p-5 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-6">
                <dt className="font-semibold text-gray-900">{row.label}</dt>
                <dd className="text-gray-700">
                  <span className="font-medium">{row.value}</span>
                  {row.note && <span className="text-gray-500"> · {row.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-sm font-medium text-red-700">
            There are no mail, package, or retail services after Wednesday, November 25.
          </p>
          <p className="mt-3 text-center text-gray-600">
            Questions? Email <a className="font-medium text-blue-900 underline" href="mailto:contact@themonarchmail.com">contact@themonarchmail.com</a>
          </p>
        </div>
      </section>

      {/* What's Next teaser */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">What is next for Thomas and family?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            The store is closing, but the work continues. Consulting, notary, shipping, printing, and a few new projects
            from our family are on the way.
          </p>
          <Link to={createPageUrl("WhatsNext")}>
            <Button size="lg" className="bg-white px-8 py-6 text-lg font-bold text-blue-900 hover:bg-gray-100">
              See what's next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
