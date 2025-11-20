import { useState } from 'react';

const ImageUpload = ({ maxImages = 5, maxSizeMB = 5, onUpload, existingImages = [] }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Check total images count
    if (images.length + files.length > maxImages) {
      setError(`You can upload up to ${maxImages} images. Please remove some images first or select fewer files.`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(
      (file) => file.size > maxSizeMB * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      setError(`The following file(s) are too large (maximum ${maxSizeMB}MB per file): ${fileNames}. Please compress or select smaller images.`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/')
    );
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      setError(`The following file(s) are not images: ${fileNames}. Please select only image files (JPG, PNG, etc.).`);
      return;
    }

    // Add new images
    const newImages = [...images, ...files];
    setImages(newImages);
    onUpload(newImages);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
    onUpload(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images ({images.length}/{maxImages})
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={images.length >= maxImages}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {(previews.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-3 gap-4">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative">
              <img
                src={url}
                alt={`Existing ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          ))}
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

