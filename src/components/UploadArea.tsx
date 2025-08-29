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
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image-flow';

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
  const [parsingMessage, setParsingMessage] = useState('Parsing PDF...');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const onDrop = useCallback(async (acceptedFiles: FileWithSubject[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileWithSubject = { ...file, subject: selectedSubject };

    setIsParsing(true);

    try {
        setParsingMessage('Reading PDF file...');
        setParsingProgress(10);
        const arrayBuffer = await fileWithSubject.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let content = '';

        setParsingMessage(`Converting ${pdf.numPages} pages to images...`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Give UI time to update
        setParsingProgress(20);

        const pagePromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pagePromises.push(pdf.getPage(i).then(async (page) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport: viewport }).promise;
              return canvas.toDataURL('image/jpeg');
            }
            return null;
          }));
        }
        
        const imageDataUris = (await Promise.all(pagePromises)).filter(Boolean) as string[];
        
        setParsingProgress(50);
        setParsingMessage(`Extracting text from ${imageDataUris.length} images...`);

        // To avoid overwhelming the AI, we can process images in chunks or one by one
        const extractedTexts = [];
        for(let i = 0; i < imageDataUris.length; i++) {
            const dataUri = imageDataUris[i];
            const result = await extractTextFromImage({ photoDataUri: dataUri });
            if (result?.text) {
              extractedTexts.push(result.text);
            }
            const progress = 50 + Math.round(((i+1) / imageDataUris.length) * 50);
            setParsingProgress(progress);
        }
        
        content = extractedTexts.join('\n\n');

        if (!content.trim()) {
            throw new Error("No text could be extracted. The document might be empty or unreadable.");
        }
        
        const newFile: UploadedFile = {
            id: `${fileWithSubject.name}-${Date.now()}`,
            name: fileWithSubject.name,
            subject: fileWithSubject.subject,
            content,
            size: fileWithSubject.size,
        };

        addFile(newFile);
        toast({
            title: 'File Uploaded',
            description: `${fileWithSubject.name} has been processed and added.`
        });

    } catch (error: any) {
        console.error('Error processing PDF:', error);
        toast({
            title: 'Processing Error',
            description: error.message || 'Could not process the PDF file.',
            variant: 'destructive'
        });
    } finally {
        setIsParsing(false);
        setParsingProgress(0);
        setParsingMessage('Parsing PDF...');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  }, [addFile, toast, selectedSubject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
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
        onDrop([file]);
    }
  };
  
  const openFileDialog = () => {
      if(fileInputRef.current) {
          fileInputRef.current.click();
      }
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Upload Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div {...getRootProps()} className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input {...getInputProps()} ref={fileInputRef} id="manual-upload-input" className="hidden" type="file" onChange={handleManualUpload}/>
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-center text-muted-foreground">
                        Drag & drop a PDF file here, or select a subject and click to upload.
                        <br/>
                        Supports both typed and handwritten notes.
                    </p>
                    {isParsing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="font-medium">{parsingMessage}</p>
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
                    <Button onClick={openFileDialog} className="w-full sm:w-auto" disabled={isParsing}>
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
