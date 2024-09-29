import clsx from "clsx";

const dot = "mx-[2px] inline-block h-2 w-2 rounded-full bg-current";

const LoadingDots = ({ className }: { className?: string }) => {
  return (
    <span className="mx-2 inline-flex items-center">
      <span className="animate-loading-dots inline-flex h-5 w-5 items-center justify-center">
        <span className={clsx(dot, "animate-blink", className)} />
        <span className={clsx(dot, "animate-blink", className)} />
        <span className={clsx(dot, "animate-blink", className)} />
      </span>
    </span>
  );
};

export default LoadingDots;
