// src/frontend/components/course/QuizView.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const questionVariants = {
    enter: { opacity: 0, scale: 0.9 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const QuizView = ({ questions }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    // Reset state when the questions prop changes
    useEffect(() => {
        handleRetake();
    }, [questions]);

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
    
    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
    };

    if (!questions || questions.length === 0) {
        return <div className="flex h-40 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= questions.length;
    const progress = (currentQuestionIndex / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {isFinished ? (
                    <motion.div key="results" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}}>
                        <Card className="text-center p-8">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold mb-4">Quiz Complete!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl font-bold mb-2">{(score / questions.length * 100).toFixed(0)}%</p>
                                <p className="text-muted-foreground">You answered {score} out of {questions.length} questions correctly.</p>
                                <Button onClick={handleRetake} className="mt-6">
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
                                        className={cn("w-full h-auto justify-start p-4 text-left text-wrap transition-all",
                                            showResult && isCorrect && "bg-green-100 dark:bg-green-900/50 border-green-500 hover:bg-green-100",
                                            showResult && isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/50 border-red-500 hover:bg-red-100"
                                        )}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={showResult}
                                    >
                                        <div className="flex-shrink-0 w-6">
                                         {showResult && (isCorrect ? <CheckCircle className="text-green-600" /> : isSelected ? <XCircle className="text-red-600" /> : null)}
                                        </div>
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        {showResult && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-6">
                                <Button onClick={handleNextQuestion} className="w-full">
                                    {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};