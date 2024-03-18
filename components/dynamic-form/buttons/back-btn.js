import Link from "next/link";

export default function BackBtn({ step, setFormStep }) {
  return (
    <div className="flex w-full justify-start">
      <button
        type="button"
        onClick={() => setFormStep(step - 1)}
        className="text-sm text-[#212121]"
      >
        Back
      </button>
    </div>
  );
}
