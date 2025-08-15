// src/frontend/pages/Non-Authenticated/PublicQuizPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, ChevronLeft, CheckCircle, XCircle, Award,ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const questionVariants = {
    enter: { opacity: 0, scale: 0.9, y: 20 },
    center: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } },
};

export const PublicQuizPage = () => {
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
            const data = await getData(`/quizzes/public/${quizId}`);
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

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
    }

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-muted/20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= questions.length;
    const progress = (currentQuestionIndex / questions.length) * 100;

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <div className="container max-w-2xl mx-auto py-8 px-4 flex-grow flex flex-col">
                <div className="mb-4">
                     <Button asChild variant="ghost" className="justify-start mb-4 -ml-4">
                        <Link to={`/course/public/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Course</Link>
                    </Button>
                </div>
            
                <AnimatePresence mode="wait">
                    {isFinished ? (
                        <motion.div key="results" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}}>
                            <Card className="text-center p-8 shadow-lg">
                                <CardHeader>
                                    <div className="mx-auto h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold mb-2">Quiz Complete!</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-6xl font-bold mb-2">{(score / questions.length * 100).toFixed(0)}%</p>
                                    <p className="text-muted-foreground">You answered {score} out of {questions.length} questions correctly.</p>
                                    <Button onClick={handleRetake} className="mt-8">
                                        Take Quiz Again
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div key={currentQuestionIndex} variants={questionVariants} initial="enter" animate="center" exit="exit" className="flex-grow flex flex-col">
                            <Progress value={progress} className="w-full mb-4 h-1.5" />
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
                                            className={cn("w-full h-auto justify-start p-4 text-left text-wrap text-base transition-all duration-300",
                                                showResult && isCorrect && "bg-green-100 dark:bg-green-900/50 border-green-500 hover:bg-green-100/80 text-green-800 dark:text-green-200",
                                                showResult && isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/50 border-red-500 hover:bg-red-100/80 text-red-800 dark:text-red-200"
                                            )}
                                            onClick={() => handleAnswerSelect(option)}
                                            disabled={showResult}
                                        >
                                            <div className="flex-shrink-0 w-6 mr-2">
                                            {showResult && (isCorrect ? <CheckCircle className="text-green-600" /> : isSelected ? <XCircle className="text-red-600" /> : null)}
                                            </div>
                                            {option}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <AnimatePresence>
                            {showResult && (
                                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-6">
                                    <Button onClick={handleNextQuestion} className="w-full" size="lg">
                                        {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};