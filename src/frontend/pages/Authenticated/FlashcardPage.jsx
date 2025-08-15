// src/frontend/pages/Authenticated/FlashcardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, ArrowLeft, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const cardVariants = {
    enter: { opacity: 0, x: 300, scale: 0.8 },
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: { zIndex: 0, opacity: 0, x: -300, scale: 0.8 },
};

export const FlashcardPage = () => {
    const { deckId, courseId } = useParams();
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);

    const fetchDeck = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getData(`/decks/${deckId}`);
            setCards(data);
        } catch (error) {
            console.error("Failed to fetch flashcards", error);
        } finally {
            setLoading(false);
        }
    }, [deckId]);

    useEffect(() => {
        fetchDeck();
    }, [fetchDeck]);

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setIsFlipped(false); // Always show the front of the next card
        setCurrentIndex(prev => (prev + newDirection + cards.length) % cards.length);
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4 flex flex-col h-full">
            <div className="mb-4">
                 <Button asChild variant="ghost" className="justify-start mb-4 -ml-4">
                    <Link to={`/course/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Course</Link>
                </Button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        className="w-full h-80"
                        style={{ perspective: '1000px', position: 'absolute' }}
                    >
                        <motion.div
                            className="w-full h-full"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => setIsFlipped(f => !f)}
                        >
                            {/* Front of the card */}
                            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                                <Card className="w-full h-full flex items-center justify-center cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-2xl md:text-3xl font-bold">{currentCard?.term}</p>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Back of the card */}
                            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                <Card className="w-full h-full flex items-center justify-center cursor-pointer">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-lg md:text-xl text-muted-foreground">{currentCard?.definition}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="mt-8">
                <Progress value={progress} className="w-full mb-4" />
                <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="lg" onClick={() => paginate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <p className="text-lg font-semibold text-muted-foreground w-20 text-center">
                        {currentIndex + 1} / {cards.length}
                    </p>
                    <Button variant="outline" size="lg" onClick={() => paginate(1)}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};