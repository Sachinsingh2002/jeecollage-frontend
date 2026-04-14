import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UploadSimple, FileArrowUp, DownloadSimple, Check, Warning } from '@phosphor-icons/react';
import Papa from 'papaparse';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SAMPLE_CSV = `name,state,city,courses,fees,admission_stats,website,description,rating,reviews_count,image
Example College,Karnataka,Bangalore,"Computer Science, Electronics",₹5L total,JEE Main / KCET,https://example.com,A great college,4.0,100,https://images.unsplash.com/photo-1562774053-701939374585?w=800`;

export const CSVImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    Papa.parse(f, {
      header: true,
      preview: 5,
      complete: (results) => { setPreview(results); }
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post(`${API}/colleges/import-csv`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message });
    } finally { setUploading(false); }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'college_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center gap-3 mb-8">
            <FileArrowUp size={32} weight="bold" className="text-[#002FA7]" />
            <h1 className="text-3xl font-bold tracking-tight" data-testid="csv-import-heading">Bulk Import Colleges</h1>
          </div>

          <div className="max-w-4xl">
            {/* Instructions */}
            <div className="bg-zinc-50 border border-zinc-200 p-6 mb-6">
              <h2 className="text-lg font-bold mb-3">CSV Format</h2>
              <p className="text-sm text-zinc-600 mb-4">Upload a CSV file with the following columns. All columns are optional except <strong>name</strong>, <strong>state</strong>, and <strong>city</strong>.</p>
              <div className="overflow-x-auto mb-4">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr className="bg-zinc-100">
                      {['name*', 'state*', 'city*', 'courses', 'fees', 'admission_stats', 'website', 'description', 'rating', 'reviews_count', 'image'].map(col => (
                        <th key={col} className="border border-zinc-200 px-3 py-2 font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-200 px-3 py-2">IIT Example</td>
                      <td className="border border-zinc-200 px-3 py-2">Karnataka</td>
                      <td className="border border-zinc-200 px-3 py-2">Bangalore</td>
                      <td className="border border-zinc-200 px-3 py-2">CS, ECE</td>
                      <td className="border border-zinc-200 px-3 py-2">₹5L</td>
                      <td className="border border-zinc-200 px-3 py-2">JEE Main</td>
                      <td className="border border-zinc-200 px-3 py-2">https://...</td>
                      <td className="border border-zinc-200 px-3 py-2">A top college</td>
                      <td className="border border-zinc-200 px-3 py-2">4.5</td>
                      <td className="border border-zinc-200 px-3 py-2">100</td>
                      <td className="border border-zinc-200 px-3 py-2">https://...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button onClick={downloadSample} data-testid="download-template" className="px-4 py-2 border border-zinc-300 text-sm font-bold hover:bg-zinc-100 flex items-center gap-2">
                <DownloadSimple size={16} weight="bold" /> Download Template CSV
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-zinc-300 p-12 text-center mb-6 hover:border-[#002FA7] transition-colors" data-testid="upload-area">
              <UploadSimple size={48} weight="thin" className="mx-auto text-zinc-300 mb-4" />
              <p className="text-sm text-zinc-500 mb-4">Select a CSV file to import colleges in bulk</p>
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-input" data-testid="csv-file-input" />
              <label htmlFor="csv-input" className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors cursor-pointer inline-block">
                Choose CSV File
              </label>
              {file && <p className="mt-3 text-sm font-bold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
            </div>

            {/* Preview */}
            {preview && (
              <div className="border border-zinc-200 p-6 mb-6" data-testid="csv-preview">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-zinc-600">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse w-full">
                    <thead>
                      <tr className="bg-zinc-100">
                        {preview.meta.fields?.map(f => <th key={f} className="border border-zinc-200 px-3 py-2 font-bold">{f}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.data.map((row, idx) => (
                        <tr key={idx}>
                          {preview.meta.fields?.map(f => <td key={f} className="border border-zinc-200 px-3 py-2 max-w-[150px] truncate">{row[f]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleUpload} disabled={uploading} data-testid="import-button"
                  className="mt-4 px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2">
                  <FileArrowUp size={20} weight="bold" />
                  {uploading ? 'Importing...' : `Import ${preview.data.length}+ Colleges`}
                </button>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`border p-6 ${result.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`} data-testid="import-result">
                {result.error ? (
                  <div className="flex items-center gap-2 text-red-700"><Warning size={20} weight="bold" /> <span className="font-bold">{result.error}</span></div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-green-700 mb-3"><Check size={20} weight="bold" /> <span className="font-bold">Import Complete</span></div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><span className="font-bold text-green-700">{result.imported}</span> imported</div>
                      <div><span className="font-bold text-amber-600">{result.skipped}</span> skipped (duplicates)</div>
                      <div><span className="font-bold text-red-600">{result.total_errors}</span> errors</div>
                    </div>
                    {result.errors?.length > 0 && (
                      <div className="mt-3 text-xs text-red-600">
                        {result.errors.map((e, i) => <div key={i}>{e}</div>)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
