"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Users, Leaf, DollarSign, Shield, Clock } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Fetch user role from API - this will return 401 if not authenticated
      const response = await fetch("/api/user/role");
      if (response.ok) {
        const data = await response.json();
        if (data.role) {
          if (data.role === "admin") {
            router.push("/dashboard/admin");
          } else if (data.role === "driver") {
            router.push("/dashboard/driver");
          } else if (data.role === "passenger") {
            router.push("/dashboard/passenger");
          }
        }
      }
    } catch (error) {
      // User not authenticated, show landing page
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-red-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent"
          >
            UniRide
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-4"
          >
            <Button variant="outline" asChild className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/signup">Get Started</Link>
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                <span className="text-red-600">Share Rides,</span>
                <br />
                <span className="text-black">Save the Planet</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl text-gray-700 leading-relaxed"
              >
                Connect with fellow students and staff for sustainable commuting. 
                Reduce costs, traffic, and carbon emissions while building a stronger campus community.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button size="lg" asChild className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6">
                  <Link href="/signup">Start Riding</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-black text-black hover:bg-black hover:text-white text-lg px-8 py-6">
                  <Link href="/login">Sign In</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 shadow-2xl">
                  <Car className="w-64 h-64 text-white" />
                </div>
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-red-600 rounded-3xl blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-red-600">UniRide</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sustainable transportation made simple for university communities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Save Money",
                description: "Split fuel costs and reduce your commuting expenses significantly.",
                color: "text-red-600",
              },
              {
                icon: Leaf,
                title: "Eco-Friendly",
                description: "Reduce carbon emissions and contribute to a greener campus.",
                color: "text-green-600",
              },
              {
                icon: Users,
                title: "Build Community",
                description: "Connect with fellow students and staff members.",
                color: "text-blue-600",
              },
              {
                icon: Clock,
                title: "Convenient",
                description: "Find rides that match your schedule and route.",
                color: "text-purple-600",
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Verified university members only. Your safety is our priority.",
                color: "text-red-600",
              },
              {
                icon: Car,
                title: "Easy Matching",
                description: "Smart algorithm connects drivers and passengers efficiently.",
                color: "text-black",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all"
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-600 to-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of students and staff already using UniRide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" asChild variant="secondary" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-6">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 text-lg px-8 py-6">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-red-600">UniRide</h3>
              <p className="text-gray-400">
                Sustainable transportation for university communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-red-600">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-red-600">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                For support, reach out to your campus administrator.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 UniRide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
