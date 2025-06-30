import React, { useState, useRef } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Upload } from 'lucide-react';

export default function MedicalResearchUI() {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [summary, setSummary] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadedFileRef = useRef(null);

  const API_BASE_URL = 'https://med-research-backend.onrender.com';

  const handleUpload = async (file) => {
    if (file) {
      setUploadName(file.name);
      const formData = new FormData();
      formData.append('file', file);

      setUploading(true);
      setSummary('Loading summary...');

      try {
        const res = await fetch(`${API_BASE_URL}/api/summarize-pdf`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setSummary(data.summary);
      } catch (err) {
        setSummary('Failed to summarize PDF.');
        console.error(err);
      }

      setUploading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      console.error('Search failed', err);
    }
    setLoading(false);
  };

  const handleSummarize = async (urlOrText) => {
    setSummary('Loading summary...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: urlOrText }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Failed to summarize.');
      console.error(err);
    }
  };

  const triggerReUpload = () => {
    const file = uploadedFileRef.current;
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Medical Research Assistant</h1>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search Article</TabsTrigger>
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Search PubMed / Semantic Scholar / DOI / Keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search & Fetch'}
              </Button>
              <div className="mt-4 space-y-3">
                {searchResults.map((res, idx) => (
                  <Card key={idx} className="p-3">
                    <h3 className="font-semibold text-lg">{res.title}</h3>
                    <p className="text-sm text-gray-600">{res.source} — {res.year}</p>
                    <p className="mt-2 text-sm">{res.abstract?.slice(0, 300)}...</p>
                    <Button
                      className="mt-2"
                      onClick={() => handleSummarize(res.abstract || res.url)}
                    >
                      Summarize
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardContent className="p-4 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{uploadName || 'Choose a medical PDF to upload'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      uploadedFileRef.current = file;
                      handleUpload(file);
                    }
                  }}
                />
              </label>
              <Button onClick={triggerReUpload} disabled={uploading}>
                {uploading ? 'Summarizing PDF...' : 'Summarize PDF'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <Textarea rows={16} placeholder="Summary will appear here..." value={summary} readOnly />
        </CardContent>
      </Card>
    </main>
  );
}
