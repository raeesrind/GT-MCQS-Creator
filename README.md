# ExamPrepAI

ExamPrepAI is an intelligent, AI-powered application designed to help students prepare for exams more effectively. Upload your handwritten or typed study notes (in PDF format), and the app will automatically generate challenging multiple-choice questions (MCQs) to test your knowledge.

## Features

- **AI-Powered MCQ Generation**: Creates practice tests from your study notes.
- **Handwriting Recognition**: Utilizes advanced OCR to extract text from scanned handwritten notes.
- **Diagram and Graph Interpretation**: AI describes visual elements within your notes.
- **Customizable Tests**: Generate chapter-wise practice tests or full-length "Grand Tests".
- **Performance Tracking**: Analyzes your test results to identify weak areas and track progress over time.
- **Responsive Design**: Fully usable on both desktop and mobile devices.

## Tech Stack

- **Framework**: Next.js (React)
- **Generative AI**: Google's Gemini models via Genkit
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Local Setup & Installation

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Google AI API Key](https://aistudio.google.com/app/apikey) for Genkit.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

You'll need to provide your Google AI API key for the generative AI features to work.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following line to the `.env` file, replacing `YOUR_API_KEY` with your actual key:

    ```env
    GEMINI_API_KEY=YOUR_API_KEY
    ```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## Hosting on Mobile with Termux

You can also run this application on an Android device using [Termux](https://termux.dev/en/).

### 1. Install Termux

Download and install Termux from F-Droid. The Google Play Store version is outdated and will not work.

### 2. Install Dependencies in Termux

Open Termux and run the following commands to install `git` and `nodejs`:

```bash
pkg update && pkg upgrade
pkg install git nodejs
```

### 3. Clone and Set Up the Project

Now, follow the same setup steps as you would on a desktop computer, right inside Termux:

```bash
# Clone your repository
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name

# Install project dependencies
npm install

# Create the environment file
echo "GEMINI_API_KEY=YOUR_API_KEY" > .env

# Run the development server
npm run dev
```

### 4. Access the App

Once the server is running, open a web browser on your mobile device and navigate to [http://localhost:9002](http://localhost:9002) to use the application.
