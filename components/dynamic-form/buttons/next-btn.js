
export default function NextBtn({cta, icon=true, disabled=false}) {

  return (
    <div className="flex justify-end w-full">
      {disabled ? (
          <button
            disabled
            className="bg-gray-300 text-[#212121] px-5 py-2 rounded-md"
          >
            {cta} {icon ? "→" : null}
          </button>
      ) : (
          <button 
            type="submit"
            className="bg-[#77dd77] text-[#212121] px-5 py-2 rounded text-sm whitespace-nowrap"
          >
            {cta} {icon ? "→" : null}
          </button>
      )}
    </div>
  );
}
