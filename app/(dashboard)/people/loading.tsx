export default function PeopleLoading() {
  return (
    <div className="flex flex-col space-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-col space-y-2">
            <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

