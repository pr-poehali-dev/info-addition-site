import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf')) return 'FileText';
    if (type.includes('video')) return 'Video';
    if (type.includes('audio')) return 'Music';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    return 'File';
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newDocuments: Document[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    }));

    setDocuments(prev => [...newDocuments, ...prev]);
    toast.success(`Загружено файлов: ${files.length}`);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Файл удалён');
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-light text-foreground mb-3 tracking-tight">
            Документы
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Загружайте и управляйте вашими файлами
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-12 border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 animate-scale-in ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
              <Icon name="Upload" size={64} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-light text-foreground mb-2">
                Перетащите файлы сюда
              </p>
              <p className="text-muted-foreground font-light">
                или выберите файлы на устройстве
              </p>
            </div>
            <label htmlFor="file-upload">
              <Button size="lg" className="cursor-pointer">
                <Icon name="Plus" size={20} className="mr-2" />
                Выбрать файлы
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card border-border"
              />
            </div>
          </div>
        )}

        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <Card
                key={doc.id}
                className="p-6 hover:shadow-lg transition-all duration-300 group animate-scale-in border-border"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon
                      name={getFileIcon(doc.type)}
                      size={28}
                      className="text-primary"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="Trash2" size={18} className="text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                
                <h3 className="font-medium text-foreground mb-2 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-light">{formatFileSize(doc.size)}</span>
                  <span className="font-light">
                    {doc.uploadedAt.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground font-light">
              Ничего не найдено
            </p>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <Icon name="FolderOpen" size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground font-light">
              Загрузите первый документ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
