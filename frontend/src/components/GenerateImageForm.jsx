import { useState } from "react";
import { Wand2, X } from "lucide-react";

const GenerateImageForm = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    prompt: "",
    quality: "standard",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData.prompt, formData.quality);
    setIsOpen(false);
    setFormData({ prompt: "", quality: "standard" });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
      >
        <Wand2 className="w-4 h-4" />
        <span>Generate</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-4">
          Generate Image
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Prompt
            </label>
            <input
              type="text"
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              placeholder="Enter your prompt..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Quality
            </label>
            <select
              value={formData.quality}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quality: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            >
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Generate Image
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenerateImageForm;
