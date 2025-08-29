'use client';

import UploadArea from '@/components/UploadArea';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prepare for Your Exam</h1>
        <p className="text-muted-foreground">
          Upload your notes in PDF format to start generating practice questions. You can upload one file per subject.
        </p>
      </div>
      <UploadArea />
    </div>
  );
}
