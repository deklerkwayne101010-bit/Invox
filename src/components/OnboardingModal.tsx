'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, Zap, Users, BarChart3, Smartphone } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to Invox!",
      description: "Let's get you set up in just 2 minutes",
      icon: <Zap className="w-8 h-8 text-primary" />,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🚀</span>
          </div>
          <p className="text-gray-600">
            Invox is designed specifically for entrepreneurs like you. We'll show you how to create professional invoices, track payments, and grow your business.
          </p>
        </div>
      )
    },
    {
      title: "Create Your First Invoice",
      description: "Professional invoices in under 2 minutes",
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Start:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Choose from 10+ professional templates</li>
              <li>• Drag & drop to customize your invoice</li>
              <li>• Auto-save prevents losing your work</li>
              <li>• Send directly via email or download PDF</li>
            </ul>
          </div>
          <div className="text-center">
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
              Create Your First Invoice
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Track Payments & Clients",
      description: "Never miss a payment again",
      icon: <Users className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Client Management</h4>
              <p className="text-sm text-blue-700">
                Keep all client details in one place with contact history and payment preferences.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Payment Tracking</h4>
              <p className="text-sm text-green-700">
                Mark invoices as sent, viewed, or paid. Get automatic payment reminders.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Analytics",
      description: "Understand your business performance",
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Dashboard Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R45,230</div>
                <div className="text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">98%</div>
                <div className="text-gray-600">Payment Rate</div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Get insights into cash flow, profitability, and business trends with beautiful charts and actionable reports.
          </p>
        </div>
      )
    },
    {
      title: "Go Mobile",
      description: "Manage your business from anywhere",
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Install Invox on Your Phone</h4>
            <p className="text-gray-600 text-sm mb-4">
              Add Invox to your home screen for the full app experience. Works offline and syncs automatically.
            </p>
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm">
              Install App
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {steps[currentStep].icon}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
              <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {steps.map((_, index) => (
              <span key={index} className={index <= currentStep ? 'text-primary font-medium' : ''}>
                {index + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}