/**
 * Contact Page
 * 
 * Batch 5 - Company Pages
 * 
 * Form with name/email/message + glowing inputs
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';
import { IndiaCustomersWidget } from '@/components/sections/marketing/IndiaCustomersWidget';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <CompanyPageShell
      eyebrow="Contact"
      title="Reach the JyotiAI team"
      description="We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible."
    >
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-white/70 leading-relaxed">
              Have questions about JyotiAI? Want to share feedback? Or need support? We're here to help.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#FFD57A] mb-2">Email</h3>
              <p className="text-white/70">support@jyoti.ai</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#FFD57A] mb-2">Support Hours</h3>
              <p className="text-white/70">24/7 AI-powered support</p>
            </div>
          </div>
          <div className="mt-8">
            <IndiaCustomersWidget />
          </div>
        </div>

        {/* Right: Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <CardHeader>
              <CardTitle className="text-3xl font-display text-gold">Send Us a Message</CardTitle>
              <CardDescription className="text-white/70">
                We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gold mb-2 block">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold focus:border-gold"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gold mb-2 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold focus:border-gold"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-gold mb-2 block">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold focus:border-gold"
                    placeholder="Your message..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full spiritual-gradient relative overflow-hidden"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    ripple.style.width = ripple.style.height = `${size}px`;
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
                    button.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                  }}
                >
                  <Send className="inline-block mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </CompanyPageShell>
  );
}

