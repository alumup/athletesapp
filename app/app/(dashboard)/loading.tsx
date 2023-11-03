import LoadingSpinner from "@/components/form/loading-spinner";
import LoadingDots from "@/components/icons/loading-dots";

export default function Loading() {
  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    </>
  );
}
