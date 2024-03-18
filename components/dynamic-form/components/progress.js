export const Progress = ({ steps, currentStep }) => {
  return (
    <div className="mb-6 w-full">
      <h6 className="text-xs font-semibold text-gray-600">
        Steps {currentStep + 1}/{steps}
      </h6>
      <div className="mt-2 h-2 w-full rounded-full bg-lime-100">
        <div
          className="h-2 rounded-full bg-lime-400 transition-all ease-linear"
          style={{ width: `${((currentStep + 1) / steps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
