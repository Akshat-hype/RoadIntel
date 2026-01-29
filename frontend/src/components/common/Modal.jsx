export default function Modal({ children }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-gray-800 p-6 rounded-lg">
        {children}
      </div>
    </div>
  );
}
