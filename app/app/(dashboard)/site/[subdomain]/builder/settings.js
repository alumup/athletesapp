export default function Settings() {
  return (
    <div className="w-full">
      <h3>Fonts</h3>
      <form>
        <div className="mt-2">
          <label htmlFor="primaryFont" className="text-xs">
            Primary Font
          </label>
          <select
            id="primaryFont"
            className="mt-1 w-full rounded border border-gray-300 p-3"
          >
            <option>Roboto</option>
            <option>Arial</option>
            <option>Helvetica</option>
          </select>
        </div>
        <div className="mt-2">
          <label htmlFor="secondaryFont" className="text-xs">
            Secondary Font
          </label>
          <select
            id="secondaryFont"
            className="mt-1 w-full rounded border border-gray-300 p-3"
          >
            <option>Roboto</option>
            <option>Arial</option>
            <option>Helvetica</option>
          </select>
        </div>
      </form>
    </div>
  );
}
