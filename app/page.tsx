'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Shield, FolderTree, Lock, Sparkles, ArrowRight, Check, Heart, Bell, Users, Mail, MapPin, Star, TrendingUp, Clock, Zap, Globe, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9f1d35] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9f1d35] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center space-x-2 bg-[#9f1d35]/10 text-[#9f1d35] px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Document Management</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Your Life's Documents.
              <br />
              <span className="text-[#9f1d35]">Organized, Secure,</span>
              <br />
              and Legacy-Ready.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-12"
            >
              MendoraBox is an innovative AI-powered document management platform that offers secure, emotionally
              intelligent digital solutions for businesses, individuals, and families. Organize, access, and share important
              personal documents—from identity proofs and insurance papers to school certificates and property records.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/user/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-[#9f1d35] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* About Us Section */}
          <section id="about" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-16 mb-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  About <span className="text-[#9f1d35]">MendoraBox</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Empowering individuals, families, and businesses with intelligent document management solutions
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <p className="text-lg text-gray-700 leading-relaxed">
                    MendoraBox was born from a simple belief: your important documents shouldn't be scattered across 
                    multiple devices, email inboxes, or filing cabinets. We envisioned a platform that combines the 
                    power of AI with emotional intelligence to create a document management system that truly understands 
                    your needs.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Whether you're managing personal identity documents, family records, business compliance files, or 
                    legacy planning documents, MendoraBox provides a secure, organized, and intuitive solution. Our 
                    platform is designed to grow with you—from individual use to family sharing to business collaboration.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Built with pride in India and adhering to global security standards, we're committed to making 
                    document management accessible, secure, and emotionally intelligent for everyone.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-[#9f1d35]/10 to-white rounded-2xl p-8 border border-[#9f1d35]/20"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
                  <p className="text-gray-700 mb-6">
                    To empower individuals, families, and businesses with tools that make document management 
                    simple, secure, and stress-free. We believe that organizing your digital life shouldn't 
                    require a technical degree—just clarity, security, and peace of mind.
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-8">Our Values</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#9f1d35] flex-shrink-0 mt-0.5" />
                      <span><strong>Security First:</strong> Your data's protection is our top priority</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#9f1d35] flex-shrink-0 mt-0.5" />
                      <span><strong>User-Centric:</strong> Designed with empathy and understanding</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#9f1d35] flex-shrink-0 mt-0.5" />
                      <span><strong>Transparency:</strong> Clear policies, no hidden surprises</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-[#9f1d35] flex-shrink-0 mt-0.5" />
                      <span><strong>Innovation:</strong> Continuously improving with AI-powered features</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Stats Section */}
          <section id="stats" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-20"
            >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-[#9f1d35] mb-2">10K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-[#9f1d35] mb-2">500K+</div>
              <div className="text-sm text-gray-600">Documents Secured</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-[#9f1d35] mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-[#9f1d35] mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </motion.div>
          </section>

          {/* Features Grid */}
          <section id="features" className="scroll-mt-24">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Powerful Features for <span className="text-[#9f1d35]">Modern Life</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to manage your documents with confidence and ease
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-3 gap-8 mt-12"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <FolderTree className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Folders</h3>
              <p className="text-gray-600">
                Organize documents with intelligent folder structures. Create unlimited levels of folders
                and subfolders to manage everything from identity proofs to property records.
              </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expiry Alerts</h3>
              <p className="text-gray-600">
                Never miss an important deadline. Get automated alerts for document expirations, renewals,
                and important dates to keep your records current.
              </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Family Vaults</h3>
              <p className="text-gray-600">
                Share important documents securely with family members. Legacy planning features ensure
                your loved ones can access what they need, when they need it.
              </p>
              </motion.div>
          </motion.div>

          {/* Additional Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            className="grid md:grid-cols-3 gap-8 mt-8"
          >
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">End-to-End Encryption</h3>
              <p className="text-gray-600">
                Your documents are encrypted both at rest and in transit. Role-based access control ensures
                only authorized users can view or modify sensitive records.
              </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">KYC Workflows</h3>
              <p className="text-gray-600">
                Streamline onboarding and compliance with built-in KYC workflows. Maintain audit-ready
                compliance without the complexity of enterprise systems.
              </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
              <div className="w-14 h-14 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-[#9f1d35]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emotionally Intelligent</h3>
              <p className="text-gray-600">
                Designed with empathy and precision. Our platform adapts to your needs, whether you're a
                freelancer, parent, or startup managing sensitive files.
              </p>
              </motion.div>
            </motion.div>
          </section>

          {/* Use Cases Section */}
          <section id="use-cases" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-24"
            >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Perfect for <span className="text-[#9f1d35]">Everyone</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you're an individual, a family, or a business, we've got you covered
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#9f1d35]/5 to-white rounded-2xl p-8 border border-[#9f1d35]/10">
                <div className="w-12 h-12 bg-[#9f1d35] rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Individuals & Families</h3>
                <p className="text-gray-600 mb-4">
                  Keep all your personal documents organized—from passports and insurance to school certificates and property deeds.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Personal document vault</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Family sharing & legacy planning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Expiry reminders & alerts</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#9f1d35]/5 to-white rounded-2xl p-8 border border-[#9f1d35]/10">
                <div className="w-12 h-12 bg-[#9f1d35] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Small Businesses</h3>
                <p className="text-gray-600 mb-4">
                  Streamline your business operations with organized document management and compliance workflows.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>KYC & compliance workflows</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Team collaboration & access control</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Audit-ready documentation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#9f1d35]/5 to-white rounded-2xl p-8 border border-[#9f1d35]/10">
                <div className="w-12 h-12 bg-[#9f1d35] rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Freelancers & Startups</h3>
                <p className="text-gray-600 mb-4">
                  Manage contracts, invoices, and important documents without the complexity of enterprise systems.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Quick document organization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Secure client document sharing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#9f1d35]" />
                    <span>Easy access from anywhere</span>
                  </li>
                </ul>
              </div>
            </div>
            </motion.div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-24"
            >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by <span className="text-[#9f1d35]">Thousands</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                See what our users are saying about MendoraBox
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#9f1d35] text-[#9f1d35]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "MendoraBox has transformed how I manage my family's documents. The expiry alerts are a lifesaver, and I love how easy it is to share important files with my spouse."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#9f1d35]/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#9f1d35]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Archit Gour</div>
                    <div className="text-sm text-gray-600">Family User</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#9f1d35] text-[#9f1d35]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "As a small business owner, the KYC workflows have saved me countless hours. The security features give me peace of mind, and my team loves how intuitive it is."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#9f1d35]/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#9f1d35]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ravi Kiran</div>
                    <div className="text-sm text-gray-600">Business Owner</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#9f1d35] text-[#9f1d35]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "The best part is knowing my documents are secure and I can access them from anywhere. The interface is clean, and the support team is incredibly responsive."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#9f1d35]/10 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#9f1d35]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Anil</div>
                    <div className="text-sm text-gray-600">Freelancer</div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </section>

          {/* Data Security & Privacy Section */}
          <section id="security-privacy" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-24 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 border border-gray-100"
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-[#9f1d35]" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Understanding Your Data Security and Privacy</h2>
              <p className="text-xl text-gray-600 font-medium">Your Trust Is Our Foundation</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-gray-700">
              <p className="text-lg leading-relaxed">
                Your data is yours—and we treat it that way. At MendoraBox, privacy isn't a feature. It's a foundation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-[#9f1d35] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h4>
                    <p className="text-gray-600">All files encrypted at rest and in transit. Every document interaction is logged for complete transparency.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-[#9f1d35] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
                    <p className="text-gray-600">Only authorized users can view or modify sensitive records. You always know who accessed what, when, and why.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-[#9f1d35] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Global Standards</h4>
                    <p className="text-gray-600">Compliance with GDPR and ISO/IEC 27001. Secure cloud infrastructure with regular audits.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-[#9f1d35] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Data Selling</h4>
                    <p className="text-gray-600">We never sell or share your data. Period. Features like masked previews and secure sharing links minimize exposure.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-lg leading-relaxed mt-8 pt-6 border-t border-gray-200">
                We believe in emotional clarity—so our privacy settings are easy to understand, not buried in legal jargon. 
                You'll always know what's happening with your records, and you'll always be in control.
              </p>
              
              <p className="text-lg font-medium text-gray-900 mt-4">
                MendoraBox is your digital sanctuary. Safe, transparent, and built for trust.
              </p>
            </div>
          </motion.div>
          </section>

          {/* Why Choose Us Section */}
          <section id="why-choose-us" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-24"
            >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Choose <span className="text-[#9f1d35]">MendoraBox</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                <Globe className="w-8 h-8 text-[#9f1d35] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Made in India</h4>
                <p className="text-sm text-gray-600">Proudly built with global standards</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                <Award className="w-8 h-8 text-[#9f1d35] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">ISO Certified</h4>
                <p className="text-sm text-gray-600">ISO/IEC 27001 compliant</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                <Clock className="w-8 h-8 text-[#9f1d35] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Always Available</h4>
                <p className="text-sm text-gray-600">99.9% uptime guarantee</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                <Heart className="w-8 h-8 text-[#9f1d35] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">User-First</h4>
                <p className="text-sm text-gray-600">Designed with empathy</p>
              </div>
            </div>
            </motion.div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-24"
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-[#9f1d35]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#9f1d35]" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-xl text-gray-600">
                We'd love to hear from you—whether you're exploring MendoraBox for personal use, business onboarding, or partnership opportunities.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">General Inquiries</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <Mail className="w-6 h-6 text-[#9f1d35]" />
                      <a href="mailto:hello@mendorabox.com" className="text-lg text-gray-700 hover:text-[#9f1d35] transition-colors">
                        hello@mendorabox.com
                      </a>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <MapPin className="w-6 h-6 text-[#9f1d35]" />
                      <span className="text-lg text-gray-700">Hyderabad, Telangana, India</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    Every message matters to us. Whether it's a bug report, a feature request, or a simple hello—we're listening, and we're here to help.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          </section>

          {/* CTA Section */}
          <section id="cta" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mt-24 bg-gradient-to-r from-[#9f1d35] to-[#b82d4a] rounded-2xl shadow-2xl p-12 text-center text-white"
            >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">
              We're not just a vault—we're your digital recordkeeper. Our mission is to empower you with tools that feel personal, secure, and transparent.
            </p>
            <p className="text-base mb-8 opacity-80 italic">
              MendoraBox is proudly built in India, with global standards of security and user experience. We're here to simplify your digital life—one record at a time.
            </p>
            <Link href="/user/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#9f1d35] px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </motion.button>
            </Link>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}