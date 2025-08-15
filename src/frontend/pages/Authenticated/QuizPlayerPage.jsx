// src/frontend/pages/Authenticated/QuizPlayerPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const questionVariants = {
    enter: { opacity: 0, scale: 0.8 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
};

export const QuizPlayerPage = () => {
    const { quizId, courseId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    const fetchQuiz = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getData(`/quizzes/${quizId}`);
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch quiz", error);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

    const handleAnswerSelect = (option) => {
        if (showResult) return;
        setSelectedAnswer(option);
        setShowResult(true);
        if (option === questions[currentQuestionIndex].correct_answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setShowResult(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= questions.length;
    const progress = (currentQuestionIndex / questions.length) * 100;

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4 flex flex-col h-[90vh]">
            <div className="mb-4">
                 <Button asChild variant="ghost" className="justify-start mb-4 -ml-4">
                    <Link to={`/course/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Course</Link>
                </Button>
            </div>
            
            <AnimatePresence mode="wait">
                {isFinished ? (
                    <motion.div key="results" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}}>
                        <Card className="text-center p-8">
                            <CardTitle className="text-3xl font-bold mb-4">Quiz Complete!</CardTitle>
                            <CardContent>
                                <p className="text-5xl font-bold mb-2">{(score / questions.length * 100).toFixed(0)}%</p>
                                <p className="text-muted-foreground">You answered {score} out of {questions.length} questions correctly.</p>
                                <Button onClick={() => { setCurrentQuestionIndex(0); setScore(0); }} className="mt-6">
                                    Retake Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div key={currentQuestionIndex} variants={questionVariants} initial="enter" animate="center" exit="exit" className="flex-grow flex flex-col">
                        <Progress value={progress} className="w-full mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <h2 className="text-2xl font-bold mb-6">{currentQuestion?.question_text}</h2>
                        
                        <div className="space-y-3">
                            {currentQuestion?.options.map((option, i) => {
                                const isCorrect = option === currentQuestion.correct_answer;
                                const isSelected = option === selectedAnswer;
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className={cn("w-full h-auto justify-start p-4 text-left text-wrap",
                                            showResult && isCorrect && "bg-green-100 dark:bg-green-900/50 border-green-500",
                                            showResult && isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/50 border-red-500"
                                        )}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={showResult}
                                    >
                                        {showResult && (isCorrect ? <CheckCircle className="mr-2 text-green-600" /> : isSelected ? <XCircle className="mr-2 text-red-600" /> : <span className="mr-2 w-5" />)}
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        {showResult && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-6">
                                <Button onClick={handleNextQuestion} className="w-full">
                                    Next Question <ChevronLeft className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};