# **App Name**: ExamPrepAI

## Core Features:

- PDF Content Extraction: Allows users to upload or drag and drop PDF documents (Physics, Chemistry, Biology notes) for parsing. The extracted content is temporarily stored in the database.
- AI-Powered MCQ Generation: Generates tricky, indirect MCQs strictly from uploaded notes using Gemini API. The tool intelligently decides how to extract concepts and rephrase questions. Includes correct answer and brief explanation. Limits questions to only the content extracted from the PDFs.
- Test Modes: Provides two test modes: Chapter Test (20 MCQs from one subject PDF) and Grand Test (100 MCQs: 30 Physics, 30 Chemistry, 30 Biology, 10 English).
- Performance Tracking: Tracks user results in a database, storing details like Test ID, Date, Subject, Topic, Score, Correct, Incorrect, and Percentage.
- Performance Dashboard: Presents a detailed performance analysis page with overall accuracy, trend graphs, subject-wise performance, and identification of strongest/weakest topics per subject.
- Exam-Style Dashboard: Offers a clean, exam-style dashboard with tabs for uploading notes, practice tests, grand tests, and performance stats. It Includes a scorecard after each test, displaying marks, percentage, subject-wise accuracy, and suggested focus topics.
- MCQ Randomization: Shuffles the MCQ options each time a test is taken to avoid memorization of the answer locations.

## Style Guidelines:

- Primary color: Dark slate blue (#374151), to suggest a focused, studious mood.
- Background color: Light gray (#F9FAFB), to allow high readability.
- Accent color: Muted turquoise (#67E8F9), for highlights and interactive elements.
- Body and headline font: 'Inter', a sans-serif for a clean, modern look.
- Use simple, consistent icons to represent subjects and topics.
- Prioritize a clear, intuitive layout that is optimized for focused learning and quick access to performance metrics.
- Incorporate subtle transitions and animations to provide feedback and enhance user engagement without distracting from the core task of learning.