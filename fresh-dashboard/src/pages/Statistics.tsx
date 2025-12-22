import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileImage, 
  Download, 
  Eye, 
  Calendar, 
  Filter, 
  Search, 
  Upload,
  Trash2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface ScreenshotFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'dashboard' | 'report' | 'analysis' | 'other';
  description?: string;
  path: string;
}

const Statistics: React.FC = () => {
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([
    {
      id: '1',
      name: 'Screenshot 2025-12-17 at /images/photo1766006180.jpg',
      size: '57.9 KB',
      date: '2025-12-17',
      type: 'dashboard',
      description: 'Dashboard overview with financial metrics',
      path: '/uploads/Screenshot 2025-12-17 at /images/photo1766006180.jpg'
    },
    {
      id: '2',
      name: 'Screenshot 2025-12-17 at 06.09.17 (1).png',
      size: '62.4 KB',
      date: '2025-12-17',
      type: 'report',
      description: 'Department creation error screenshot',
      path: '/uploads/Screenshot 2025-12-17 at 06.09.17 (1).png'
    },
    {
      id: '3',
      name: 'Screenshot 2025-12-18 at 00.53.46 (1).png',
      size: '62.4 KB',
      date: '2025-12-18',
      type: 'report',
      description: 'Monthly financial report summary',
      path: '/uploads/Screenshot 2025-12-18 at 00.53.46 (1).png'
    },
    {
      id: '4',
      name: 'e_logo.png',
      size: '1.36 MB',
      date: '2025-12-15',
      type: 'other',
      description: 'ë ecosystem logo',
      path: '/uploads/e_logo.png'
    },
    {
      id: '5',
      name: 'FinancialAnalysis.jpg',
      size: '1.16 MB',
      date: '2025-12-15',
      type: 'analysis',
      description: 'Financial analysis data',
      path: '/images/FinancialAnalysis.jpg'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ScreenshotFile | null>(null);

  const filteredScreenshots = screenshots.filter(screenshot => {
    const matchesSearch = screenshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screenshot.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || screenshot.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleViewImage = (screenshot: ScreenshotFile) => {
    setSelectedImage(screenshot);
  };

  const handleDownload = (screenshot: ScreenshotFile) => {
    const link = document.createElement('a');
    link.href = screenshot.path;
    link.download = screenshot.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      setScreenshots(prev => prev.filter(s => s.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newScreenshot: ScreenshotFile = {
          id: Date.now().toString(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          date: format(new Date(), 'yyyy-MM-dd'),
          type: 'other',
          description: 'Newly uploaded screenshot',
          path: URL.createObjectURL(file)
        };
        setScreenshots(prev => [newScreenshot, ...prev]);
      }
    };
    input.click();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dashboard': return 'bg-blue-100 text-blue-800';
      case 'report': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Screenshots</h1>
          <p className="text-gray-600 mt-1">Manage and view uploaded screenshots and statistical images</p>
        </div>
        <Button onClick={handleUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Screenshot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Screenshot Gallery</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search screenshots..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
              <CardDescription>
                {filteredScreenshots.length} screenshot{filteredScreenshots.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setSelectedType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Screenshots</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="report">Reports</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredScreenshots.map((screenshot) => (
                    <Card key={screenshot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={screenshot.path}
                          alt={screenshot.name}
                          className="w-full h-full object-contain p-2 cursor-pointer"
                          onClick={() => handleViewImage(screenshot)}
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate" title={screenshot.name}>
                              {screenshot.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate" title={screenshot.description}>
                              {screenshot.description}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(screenshot.type)}`}>
                            {screenshot.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {screenshot.date}
                            </span>
                            <span>{screenshot.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => handleViewImage(screenshot)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => handleDownload(screenshot)}
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(screenshot.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredScreenshots.length === 0 && (
                  <div className="text-center py-12">
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No screenshots found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try a different search term' : 'Upload your first screenshot to get started'}
                    </p>
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics Summary</CardTitle>
              <CardDescription>Overview of uploaded content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileImage className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Total Screenshots</p>
                      <p className="text-sm text-gray-600">{screenshots.length} files</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{screenshots.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Total Size</p>
                      <p className="text-sm text-gray-600">All uploaded files</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {screenshots.reduce((acc, s) => {
                      const size = parseFloat(s.size);
                      return acc + size;
                    }, 0).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Latest Upload</p>
                      <p className="text-sm text-gray-600">Most recent file</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-purple-600">
                    {screenshots.length > 0 ? screenshots[0].date : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Upload className="h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg">{selectedImage.name}</h3>
                <p className="text-sm text-gray-600">{selectedImage.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <img
                src={selectedImage.path}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[60vh] object-contain mx-auto"
              />
            </div>
            <div className="p-4 border-t text-sm text-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Size: {selectedImage.size}</span>
                <span>Date: {selectedImage.date}</span>
                <span className={`px-2 py-1 rounded-full ${getTypeColor(selectedImage.type)}`}>
                  {selectedImage.type}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleDelete(selectedImage.id);
                  setSelectedImage(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;