'use client';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useRef } from 'react';
import { useApp } from '@/providers/app-provider';
import { ALL_SUBJECTS, type Subject, type UploadedFile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, X, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/lib/utils';

// Set up the PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface FileWithSubject extends File {
    subject?: Subject;
    size: number;
}

export default function UploadArea() {
  const { addFile, removeFile, uploadedFiles } = useApp();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const onDrop = useCallback(async (acceptedFiles: FileWithSubject[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if(!file.subject) {
      file.subject = selectedSubject;
    }

    setIsParsing(true);
    setParsingProgress(0);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let content = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            setParsingProgress(Math.round((i / pdf.numPages) * 100));
        }

        const newFile: UploadedFile = {
            id: `${file.name}-${Date.now()}`,
            name: file.name,
            subject: file.subject,
            content,
            size: file.size,
        };

        addFile(newFile);
        toast({
            title: 'File Uploaded',
            description: `${file.name} has been parsed and added.`
        });

    } catch (error) {
        console.error('Error parsing PDF:', error);
        toast({
            title: 'Parsing Error',
            description: 'Could not parse the PDF file. It might be corrupted or protected.',
            variant: 'destructive'
        });
    } finally {
        setIsParsing(false);
        setParsingProgress(0);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  }, [addFile, toast, selectedSubject]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop, 
    noClick: true,
    noKeyboard: true,
    accept: { 'application/pdf': ['.pdf'] },
    onDropRejected: () => {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a PDF file.',
            variant: 'destructive'
        });
    }
  });

  const handleManualUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0] as FileWithSubject;
        file.subject = selectedSubject;
        onDrop([file]);
    }
  };

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Upload Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div {...getRootProps()} className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input {...getInputProps({onChange: handleManualUpload})} ref={fileInputRef} id="manual-upload-input" className="hidden" />
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-center text-muted-foreground">
                        Drag & drop a PDF file here, or select a subject and click to upload.
                    </p>
                    {isParsing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="font-medium">Parsing PDF...</p>
                        <Progress value={parsingProgress} className="w-1/2 mt-2" />
                      </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedSubject} onValueChange={(value) => setSelectedSubject(value as Subject)}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_SUBJECTS.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={open} className="w-full sm:w-auto">
                        Choose File
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {uploadedFiles.map(file => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{file.subject}</span>
                            <span className="text-xs text-muted-foreground/80 bg-background/50 px-1.5 py-0.5 rounded-sm">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
    </div>
  );
}