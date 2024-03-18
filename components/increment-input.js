"use client";

export default function IncrementInput({ count, setCount }) {
  const increment = () => {
    if (count < 4) {
      setCount(count + 1);
    }
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between rounded border border-gray-100">
      <div className="flex">
        <button
          type="button"
          onClick={decrement}
          className="mr-1 rounded bg-black px-3 text-white"
        >
          -
        </button>
        <input
          readOnly
          type="text"
          className="w-[50px] rounded border border-gray-200 text-center leading-4"
          value={count}
        />
        <button
          type="button"
          onClick={increment}
          className={`${
            count < 4 ? "bg-black " : "bg-gray-300"
          } ml-1 rounded px-3 text-white`}
        >
          +
        </button>
      </div>
    </div>
  );
}
