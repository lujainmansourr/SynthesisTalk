import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedText(response.data.content);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-serif font-bold mb-4">Upload a PDF Document</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleUpload} className="bg-blue-500 px-4 py-2 rounded">Upload</button>
      <div className="mt-4 max-w-lg bg-white text-black p-4 rounded">{extractedText}</div>
    </div>
  );
}

export default Upload;
