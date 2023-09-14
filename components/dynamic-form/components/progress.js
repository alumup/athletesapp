
export const Progress = ({steps, currentStep}) => {

  return (
    <div className="w-full mb-6">
      <h6 className="font-semibold text-xs text-gray-600">Steps {currentStep + 1}/{steps}</h6>
      <div className="mt-2 w-full bg-lime-100 rounded-full h-2">
        <div className="bg-lime-400 h-2 rounded-full transition-all ease-linear" style={{width: `${((currentStep + 1)/steps) * 100}%`}}></div>
      </div>
    </div>
  )
}