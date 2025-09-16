import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  FileText, 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Download,
  BookOpen,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  totalQuestions: number;
  timeLimit?: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[];
  timeSpent: number;
}

interface Topic {
  subject: string;
  count: number;
}

const AIQuizGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'take'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // n8n webhook URLs - replace with your actual n8n instance URL
  const N8N_BASE_URL = 'http://localhost:5678/webhook-test';

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeLeft]);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/get-topics`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setUploadedFile(file);
  };

  const submitFile = async () => {
    if (!uploadedFile) return;

    setUploadLoading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('subject', uploadedFile.name.split('.')[0]);

    try {
      const response = await fetch(`${N8N_BASE_URL}/upload-material`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setUploadedFile(null);
        fetchTopics(); // Refresh topics after upload
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!selectedTopic) {
      alert('Please select a topic first.');
      return;
    }

    setQuizLoading(true);

    try {
      const response = await fetch(`${N8N_BASE_URL}/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty,
          questionCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuiz(data.quiz);
        setActiveTab('take');
      } else {
        throw new Error('Quiz generation failed');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const startQuiz = () => {
    if (!currentQuiz) return;
    
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    setStartTime(Date.now());
    
    if (currentQuiz.timeLimit) {
      setTimeLeft(currentQuiz.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentQuiz || !startTime) return;

    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    let correctCount = 0;
    const answers = currentQuiz.questions.map(question => {
      const selectedAnswer = selectedAnswers[question.id] ?? -1;
      const correct = selectedAnswer === question.correctAnswer;
      if (correct) correctCount++;
      
      return {
        questionId: question.id,
        selectedAnswer,
        correct
      };
    });

    const result: QuizResult = {
      score: Math.round((correctCount / currentQuiz.questions.length) * 100),
      totalQuestions: currentQuiz.questions.length,
      answers,
      timeSpent
    };

    setQuizResult(result);
    setQuizStarted(false);
    setTimeLeft(null);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    setTimeLeft(null);
    setStartTime(null);
    setActiveTab('generate');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="w-16 h-16 text-primary-color mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upload Training Materials</h2>
        <p className="text-gray-600">Upload PDF documents to create your knowledge base</p>
      </div>

      <div className="card">
        <div className="dropzone" onClick={() => document.getElementById('file-input')?.click()}>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="dropzone-content">
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-lg font-medium">Click to upload PDF</p>
            <p className="text-sm text-gray-500">Only PDF files are supported</p>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">{uploadedFile.name}</span>
              </div>
              <button
                onClick={submitFile}
                disabled={uploadLoading}
                className="btn-primary"
              >
                {uploadLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">File uploaded successfully!</span>
          </div>
        )}
      </div>

      {topics.length > 0 && (
        <div className="card">
          <h3 className="card-title">Available Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{topic.subject}</span>
                  <span className="text-sm text-gray-500">{topic.count} docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 text-primary-color mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generate Quiz</h2>
        <p className="text-gray-600">Create a personalized quiz from your training materials</p>
      </div>

      <div className="card">
        <h3 className="card-title">Quiz Configuration</h3>
        
        <div className="space-y-4">
          <div className="form-group">
            <label>Select Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="filter-select"
            >
              <option value="">Choose a topic...</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic.subject}>
                  {topic.subject} ({topic.count} documents)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty Level</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    difficulty === level
                      ? 'bg-primary-color text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Number of Questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="filter-select"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <button
            onClick={generateQuiz}
            disabled={!selectedTopic || quizLoading}
            className="btn-primary w-full"
          >
            {quizLoading ? (
              <>
                <div className="loading-spinner mr-2" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTakeTab = () => {
    if (!currentQuiz) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Quiz Available</h3>
          <p className="text-gray-600 mb-4">Generate a quiz first to start taking it.</p>
          <button
            onClick={() => setActiveTab('generate')}
            className="btn-primary"
          >
            Generate Quiz
          </button>
        </div>
      );
    }

    if (quizResult) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Award className="w-16 h-16 text-primary-color mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          </div>

          <div className="card">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary-color">
                {quizResult.score}%
              </div>
              <p className="text-xl">
                You scored {quizResult.answers.filter(a => a.correct).length} out of {quizResult.totalQuestions} questions correctly
              </p>
              <p className="text-gray-600">
                Time spent: {formatTime(quizResult.timeSpent)}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Review Answers</h3>
            <div className="space-y-4">
              {currentQuiz.questions.map((question, index) => {
                const userAnswer = quizResult.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.correct || false;
                
                return (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Q{index + 1}: {question.question}</h4>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : optionIndex === userAnswer?.selectedAnswer && !isCorrect
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-50'
                          }`}
                        >
                          {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600">✓ Correct</span>
                          )}
                          {optionIndex === userAnswer?.selectedAnswer && !isCorrect && (
                            <span className="ml-2 text-red-600">✗ Your answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={resetQuiz} className="btn-secondary flex-1">
              <RotateCcw className="w-5 h-5 mr-2" />
              Take Another Quiz
            </button>
          </div>
        </div>
      );
    }

    if (!quizStarted) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Play className="w-16 h-16 text-primary-color mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
          </div>

          <div className="card">
            <h3 className="card-title">{currentQuiz.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-primary-color mx-auto mb-2" />
                <div className="font-semibold">{currentQuiz.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-primary-color mx-auto mb-2" />
                <div className="font-semibold">
                  {currentQuiz.timeLimit ? `${currentQuiz.timeLimit} min` : 'No limit'}
                </div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-8 h-8 text-primary-color mx-auto mb-2" />
                <div className="font-semibold capitalize">{difficulty}</div>
                <div className="text-sm text-gray-600">Difficulty</div>
              </div>
            </div>
            
            <button onClick={startQuiz} className="btn-primary w-full">
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </h2>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-color h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswers[currentQuestion.id] === index
                    ? 'border-primary-color bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAnswers[currentQuestion.id] === index
                      ? 'border-primary-color bg-primary-color text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion.id] === index && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
              <button
                onClick={handleQuizSubmit}
                className="btn-primary"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'upload', label: 'Upload Materials', icon: Upload },
            { id: 'generate', label: 'Generate Quiz', icon: Brain },
            { id: 'take', label: 'Take Quiz', icon: Play }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-white text-primary-color shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'generate' && renderGenerateTab()}
      {activeTab === 'take' && renderTakeTab()}
    </div>
  );
};

export default AIQuizGenerator;