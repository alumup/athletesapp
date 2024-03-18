export default function NextBtn({ cta, icon = true, disabled = false }) {
  return (
    <div className="flex w-full justify-end">
      {disabled ? (
        <button
          disabled
          className="rounded-md bg-gray-300 px-5 py-2 text-[#212121]"
        >
          {cta} {icon ? "→" : null}
        </button>
      ) : (
        <button
          type="submit"
          className="whitespace-nowrap rounded bg-[#77dd77] px-5 py-2 text-sm text-[#212121]"
        >
          {cta} {icon ? "→" : null}
        </button>
      )}
    </div>
  );
}
