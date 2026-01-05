export default function InputField({ label, type, id, placeholder, value, onChange, required = true }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}         // <--- Added this
        onChange={onChange}   // <--- Added this
        className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-900 text-slate-900 dark:text-white sm:text-sm transition-all duration-200 ease-in-out"
        placeholder={placeholder}
      />
    </div>
  );
}