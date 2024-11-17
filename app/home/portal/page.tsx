"use client"

import BillingPortalButton from "@/components/billing-portal-button"

export default function PortalPage(): JSX.Element {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Billing Portal
          </h1>
          
          <div className="bg-white shadow sm:rounded-lg p-6 max-w-md mx-auto rounded-lg">
            <div className="flex justify-center flex-col items-center text-center">
              <p className="text-gray-600 mb-6">
                Manage your subscription and billing details
              </p>
              <BillingPortalButton />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
