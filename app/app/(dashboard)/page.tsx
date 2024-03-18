import { Card } from "@/components/ui/card";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Overview() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col space-y-12 p-8">
      <div className="grid w-full grid-cols-3 gap-5">
        <Link href="/people" className="col-span-1 ">
          <Card className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                People
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                301
              </p>
            </div>
            <div>
              <UserIcon className="h-6 w-6" />
            </div>
          </Card>
        </Link>
        <Link href="/teams" className="col-span-1 ">
          <Card className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Teams
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                17
              </p>
            </div>
            <div>
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </Card>
        </Link>
        <Link href="/events" className="col-span-1 ">
          <Card className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Events
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                1
              </p>
            </div>
            <div>
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
