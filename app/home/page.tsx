import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-5xl mb-4">
            Team Management for Teams and Clubs.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light font-sans">
            Athletes App is the easiest way to manage your athletes and teams.
          </p>
          <div className="flex justify-center">
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Schedule a Demo
              </Button>
            </Link>
            <Link href="/portal">
              <Button
                variant="outline" 
                className="bg-white hover:bg-gray-50"
              >
                Billing Portal
              </Button>
            </Link>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Roster Management</h3>
            <p className="text-gray-600">Keep track of all your athletes in one place with detailed profiles and stats</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Invoicing and Payments</h3>
            <p className="text-gray-600">Automated payment processing and tracking for team fees and equipment costs</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Email Communication</h3>
            <p className="text-gray-600">Stay connected with instant updates and announcements to parents and team members</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
              <p className="text-gray-600 mb-6">Join thousands of teams already using our platform to manage their athletes</p>
              <div className="space-x-4">
                <a href="/signup" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white h-10 px-4 py-2 hover:bg-blue-700">
                  Get Started
                </a>
                <a href="/demo" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white h-10 px-4 py-2 hover:bg-gray-100">
                  Request Demo
                </a>
              </div>
            </div>
            <div className="flex-1">
              <img 
                src="/dashboard-preview.png" 
                alt="Dashboard Preview" 
                className="rounded-lg shadow-md"
                width={500}
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
