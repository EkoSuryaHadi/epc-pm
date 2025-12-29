'use client';

import { motion } from 'framer-motion';
import { GradientCard } from './modern-card';
import { Button } from './button';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface InfoPageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
  features: string[];
  ctaText?: string;
  ctaLink?: string;
}

export function InfoPageTemplate({
  title,
  description,
  icon: Icon,
  gradient,
  features,
  ctaText = "Go to Projects",
  ctaLink = "/dashboard/projects"
}: InfoPageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            {description}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GradientCard gradient={gradient} className="relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Icon className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Project-Specific Features
                  </h2>
                  <p className="text-white/90">
                    This functionality is available within each project for better organization
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Available Features:
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <div className="w-2 h-2 rounded-full bg-white/60" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <Link href={ctaLink}>
                <Button 
                  size="lg" 
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold"
                >
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </GradientCard>
        </motion.div>

        {/* Quick Access Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>How to access:</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Navigate to the <strong>Projects</strong> page</li>
              <li>Select a project from the list</li>
              <li>Click on the relevant module from the project dashboard</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
