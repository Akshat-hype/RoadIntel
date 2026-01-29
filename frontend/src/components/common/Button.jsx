export default function Button({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
      {...props}
    >
      {children}
    </button>
  );
}
