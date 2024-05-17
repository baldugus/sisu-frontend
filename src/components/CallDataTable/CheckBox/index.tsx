interface ICheckBox {
  checked: boolean;
  onClick: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  id: string | undefined;
}

const CheckMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5"
    viewBox="0 0 20 20"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const CheckBox = ({ checked, onClick, id }: ICheckBox) => (
  <div>
    <label
      className="relative flex items-center p-3 rounded-full cursor-pointer"
      htmlFor={id}
      data-ripple-dark="true"
    >
      <input
        type="checkbox"
        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
        id={id}
        onClick={onClick}
        readOnly
        checked={checked}
        
      />
      <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
        <CheckMark />
      </div>
    </label>
  </div>
);

export default CheckBox;
