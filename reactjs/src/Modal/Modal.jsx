import React, { useState } from "react";


// Modal Component
const Modal = ({ show, onClose, onLocalUpload, onUrlSubmit }) => {
  const [urlInput, setUrlInput] = useState("");

  if (!show) return null;

  const handleSubmitUrl = () => {
    if (urlInput.trim()) {
      onUrlSubmit(urlInput);
      setUrlInput(""); // Clear the input field
      onClose(); // Close the modal
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg h-[450px] w-full max-w-[650px] mx-4">
        <h2 className="text-2xl font-bold mb-6">Upload Banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="btn-dark w-full py-3 text-lg"
            onClick={() => {
              onLocalUpload();
              onClose();
            }}
          >
            Upload Image Locally
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Enter Image URL"
              className="w-full px-4 py-3 border rounded-lg mb-2 text-lg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button
              className="btn-light w-full py-3 text-lg"
              onClick={handleSubmitUrl}
            >
              Submit Image URL
            </button>
          </div>
        </div>
        <button
          className="btn-light w-full py-3 mt-6 text-lg"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Modal;
