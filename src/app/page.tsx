'use client';

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Shield, BarChart3, Users, Star, Play, Sparkles } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Lightning Fast",
      description: "Create professional invoices in under 2 minutes with our intuitive drag-and-drop interface."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and SOC 2 compliance."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Smart Analytics",
      description: "Get insights into your business performance with beautiful charts and actionable reports."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Client Management",
      description: "Keep track of all your clients in one place with detailed profiles and payment history."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "AI-Powered",
      description: "Let AI handle expense categorization and provide smart suggestions for your business."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: "Payment Tracking",
      description: "Never miss a payment with automated reminders and real-time payment status updates."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Graphic Designer",
      content: "Invox transformed how I manage my business. What used to take hours now takes minutes!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Small Business Owner",
      content: "The analytics are incredible. I finally understand my business performance at a glance.",
      rating: 5
    },
    {
      name: "Jennifer Davis",
      role: "Management Consultant",
      content: "Professional invoices that impress clients and automated workflows that save me time.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Invox</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-lg hover:from-primary-dark hover:to-primary transition-all shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              #1 Invoice Software for Small Businesses
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Invoicing
              <span className="block bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning invoices, track payments, and grow your business with the most intuitive invoicing platform designed specifically for entrepreneurs like you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-xl text-lg font-semibold inline-flex items-center group"
              >
                Start Creating Invoices
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center px-8 py-4 text-gray-700 hover:text-primary transition-colors group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Free 14-day trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600">Invox Dashboard</span>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl">
                  <div className="text-2xl font-bold text-primary">R45,230</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
                <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-xl">
                  <div className="text-2xl font-bold text-secondary">23</div>
                  <div className="text-sm text-gray-600">Active Invoices</div>
                </div>
                <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-xl">
                  <div className="text-2xl font-bold text-accent">98%</div>
                  <div className="text-sm text-gray-600">Payment Rate</div>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">R12,450</div>
                  <div className="text-sm text-gray-600">Profit This Month</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium">Acme Corp</div>
                        <div className="text-sm text-gray-500">2 days ago</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">R5,400</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Paid</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium">TechStart Inc</div>
                        <div className="text-sm text-gray-500">1 week ago</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">R8,200</div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Sent</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-primary text-white p-4 rounded-lg hover:bg-primary-dark transition-colors">
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-sm font-medium">New Invoice</div>
                    </button>
                    <button className="bg-secondary text-white p-4 rounded-lg hover:bg-secondary-dark transition-colors">
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-sm font-medium">Add Expense</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From creating invoices to tracking payments, Invox provides all the tools you need to manage your business finances professionally.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Entrepreneurs Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of small business owners who trust Invox with their invoicing needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of entrepreneurs who have simplified their invoicing with Invox. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-primary px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-xl text-lg font-semibold inline-flex items-center justify-center group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-primary-200 text-sm sm:text-base">
              No credit card required • 14-day free trial
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold">Invox</span>
              </div>
              <p className="text-gray-400">
                Professional invoicing made simple for small businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Invox. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
