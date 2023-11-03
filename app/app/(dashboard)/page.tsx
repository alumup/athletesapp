import { Card } from "@/components/ui/card";
import { CalendarDaysIcon, UserGroupIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";


export default function Overview() {
  return (
    <div className="flex max-w-7xl w-full mx-auto flex-col space-y-12 p-8">
      <div className="grid grid-cols-3 gap-5 w-full">
        <Link href="/people" className="col-span-1 ">
          <Card className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                People
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                301
              </p>
            </div>
            <div>
              <UserIcon className="w-6 h-6" />
            </div>
          </Card>
        </Link>
        <Link href="/teams" className="col-span-1 ">
          <Card className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Teams
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                17
              </p>
            </div>
            <div>
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </Card>
        </Link>
        <Link href="/events" className="col-span-1 ">
          <Card className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Events
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                1
              </p>
            </div>
            <div>
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
          </Card>
        </Link>

      </div>

    </div>
  );
}
