import React, { useState } from 'react';
import { AlertTriangle, User, Settings, Trash2, Eye, EyeOff, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import SEO from '../components/SEO';

export default function DeleteAccountGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const steps = [
    {
      title: "Navigate to Profile",
      description: "Click on your profile to access account settings",
      icon: User,
      detail: "Look for your profile present in the bottom navigation bar"
    },
    {
      title: "Open Settings",
      description: "Click the Settings icon in the top right corner",
      icon: Settings,
      detail: "The settings icon typically looks like a gear or cog wheel"
    },
    {
      title: "Find Dangerous Zone",
      description: "Scroll down to locate the 'Dangerous Zone' tab",
      icon: AlertTriangle,
      detail: "This section contains irreversible account actions and is usually at the bottom"
    },
    {
      title: "Click Delete Account",
      description: "Select the 'Delete Account' option",
      icon: Trash2,
      detail: "This button is typically highlighted in red to indicate its destructive nature"
    },
    {
      title: "Enter Password",
      description: "Type your current password to confirm deletion",
      icon: Shield,
      detail: "This security step ensures only you can delete your account"
    }
  ];

  const consequences = [
    "All your personal data will be permanently deleted",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <SEO
        title="Delete Account - Step by Step Guide"
        description="Learn how to safely delete your CoachAcadem account with our step-by-step guide. Understand the process and consequences before proceeding with account deletion."
        name="CoachAcadem"
        type="HowTo"
        schema={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Delete Your CoachAcadem Account",
          "description": "Step-by-step guide to delete your CoachAcadem account safely",
          "step": [
            {
              "@type": "HowToStep",
              "name": "Navigate to Profile",
              "text": "Click on your profile to access account settings"
            },
            {
              "@type": "HowToStep", 
              "name": "Open Settings",
              "text": "Click the Settings icon in the top right corner"
            },
            {
              "@type": "HowToStep",
              "name": "Find Dangerous Zone", 
              "text": "Scroll down to locate the 'Dangerous Zone' tab"
            },
            {
              "@type": "HowToStep",
              "name": "Click Delete Account",
              "text": "Select the 'Delete Account' option"
            },
            {
              "@type": "HowToStep",
              "name": "Enter Password",
              "text": "Type your current password to confirm deletion"
            }
          ],
          "supply": [
            {
              "@type": "HowToSupply",
              "name": "Current password"
            }
          ],
          "tool": [
            {
              "@type": "HowToTool", 
              "name": "CoachAcadem Mobile App"
            }
          ]
        }}
        surveyImage="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png"
        surveyUrl="https://www.coachacadem.ae/delete-account"
        robotText="noindex, nofollow"
      />
      {/* Header Warning */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-500 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-red-900">Delete Your Account</h1>
            <p className="text-red-700 mt-1">This action is permanent and cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            ⚠️ <strong>Warning:</strong> Once you delete your account, all your data will be permanently removed from our servers. 
            Please make sure you've backed up any important information before proceeding.
          </p>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <CheckCircle className="h-7 w-7 text-blue-600" />
          Step-by-Step Instructions
        </h2>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            
            return (
              <div
                key={index}
                className={`border rounded-xl p-5 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    isActive 
                      ? 'bg-blue-500' 
                      : isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-gray-400'
                  }`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {index + 1}: {step.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    {isActive && (
                      <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> {step.detail}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className={`h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>

                {/* Password Demo for Step 5 */}
                {index === 4 && isActive && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your password to confirm deletion:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This is a demonstration - your actual password would be required on the real page
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Step
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step
          </button>
        </div>
      </div>

      {/* What Happens When You Delete */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-3">
          <Trash2 className="h-7 w-7 text-orange-600" />
          What Happens When You Delete Your Account
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {consequences.map((consequence, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white border border-orange-200 rounded-lg">
              <div className="bg-orange-500 rounded-full p-1 mt-0.5">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <p className="text-orange-800 text-sm">{consequence}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Options */}
  

      {/* Progress Indicator */}
      <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="text-sm text-gray-600 mb-2">Progress</div>
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}