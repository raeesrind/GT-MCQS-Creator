'use client';

import { ParsedMCQ } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewViewProps {
  mcqs: ParsedMCQ[];
  userAnswers: (string | undefined)[];
}

const optionLetters = ['A', 'B', 'C', 'D'];

export default function ReviewView({ mcqs, userAnswers }: ReviewViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {mcqs.map((mcq, index) => (
          <div key={mcq.id}>
            <p className="font-semibold mb-4">
              Q{index + 1}. {mcq.question}
            </p>
            <div className="space-y-2">
              {mcq.options.map((option, optionIndex) => {
                const isCorrect = option === mcq.correctAnswer;
                const isUserChoice = option === userAnswers[index];
                
                let optionStyle = 'text-muted-foreground';
                if (isCorrect) {
                  optionStyle = 'text-green-600 font-semibold';
                } else if (isUserChoice) {
                  optionStyle = 'text-red-600';
                }

                return (
                  <div key={optionIndex} className={`flex items-center gap-2 ${optionStyle}`}>
                    <span>
                      {optionLetters[optionIndex]}) {option}
                    </span>
                    {isCorrect && <span className="text-green-600">✅</span>}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-sm p-2 bg-secondary rounded-md">
                <span className="font-semibold">Explanation: </span>
                <span>{mcq.explanation}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
