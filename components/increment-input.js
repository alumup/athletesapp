'use client'

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
    <div className="flex flex-col items-center justify-between border border-gray-100 rounded">
      <div className="flex">
        <button type="button" onClick={decrement} className="bg-black px-3 text-white mr-1 rounded">-</button>
        <input readOnly type="text" className="w-[50px] text-center border leading-4 border-gray-200 rounded" value={count} />
        <button type="button" onClick={increment} className={`${count < 4 ? 'bg-black ' : 'bg-gray-300'} px-3 text-white ml-1 rounded`}>+</button>
      </div>
    </div>
  );
}
