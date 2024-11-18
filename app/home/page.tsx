import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="py-20 flex flex-col justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-5xl mb-4">
            Roster Management for Teams and Clubs.
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
            <p className="text-gray-600">Keep track of all your athletes and their relationships in one place with detailed profiles.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Invoicing and Payments</h3>
            <p className="text-gray-600">Automated payment processing and tracking for team fees and equipment costs.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Email Communication</h3>
            <p className="text-gray-600">Stay connected with instant updates and announcements to parents and team members via email.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
