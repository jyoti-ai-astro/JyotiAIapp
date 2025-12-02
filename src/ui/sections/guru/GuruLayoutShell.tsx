'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Clock } from 'lucide-react';
import { fadeUp } from '@/src/ui/theme/global-motion';

interface GuruLayoutShellProps {
  children: React.ReactNode;
}

export default function GuruLayoutShell({ children }: GuruLayoutShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/80 backdrop-blur-xl p-6 md:p-8 lg:p-10 shadow-[0_8px_32px_rgba(255,213,122,0.15)]"
    >
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left: Session Details (optional, narrow column) */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Your session
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#FFD57A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      End-to-end encrypted
                    </p>
                    <p className="text-xs text-white/60">
                      Your conversations are private
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#FFD57A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Vedic-grade accuracy
                    </p>
                    <p className="text-xs text-white/60">
                      Powered by ancient wisdom
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FFD57A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Available 24/7
                    </p>
                    <p className="text-xs text-white/60">
                      Ask anytime, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chat UI */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </motion.div>
  );
}

