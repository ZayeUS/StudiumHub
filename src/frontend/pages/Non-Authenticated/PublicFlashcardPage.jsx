// src/frontend/pages/Non-Authenticated/PublicFlashcardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const cardVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 500 : -500,
        opacity: 0,
        scale: 0.8,
        rotate: direction > 0 ? 15 : -15,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 260, damping: 30 }
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 500 : -500,
        opacity: 0,
        scale: 0.8,
        rotate: direction < 0 ? 15 : -15,
        transition: { duration: 0.3 }
    }),
};

export const PublicFlashcardPage = () => {
    const { deckId, courseId } = useParams();
    const [cards, setCards] = useState([]);
    const [[page, direction], setPage] = useState([0, 0]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDeck = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getData(`/decks/public/${deckId}`);
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
        setIsFlipped(false);
        setTimeout(() => {
            setPage([page + newDirection, newDirection]);
        }, 150); 
    };
    
    const cardIndex = ((page % cards.length) + cards.length) % cards.length;
    const currentCard = cards[cardIndex];
    const progress = ((cardIndex + 1) / cards.length) * 100;

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-muted/20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <div className="container max-w-2xl mx-auto py-8 px-4 flex-grow flex flex-col">
                <div className="w-full mb-4">
                     <Button asChild variant="ghost" className="justify-start -ml-4">
                     <Link to={`/course/public/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Course</Link>
                     </Button>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center relative">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={page}
                            custom={direction}
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full h-80 md:h-96 absolute cursor-pointer"
                            style={{ perspective: '1200px' }}
                            onClick={() => setIsFlipped(f => !f)}
                        >
                            <motion.div
                                className="w-full h-full"
                                style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                                <Card className="absolute w-full h-full flex items-center justify-center p-6 text-center shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                                    <p className="text-2xl md:text-3xl font-bold">{currentCard?.term}</p>
                                </Card>
                                <Card className="absolute w-full h-full flex items-center justify-center p-6 text-center shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <p className="text-lg md:text-xl text-muted-foreground">{currentCard?.definition}</p>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                <div className="mt-8">
                    <Progress value={progress} className="w-full mb-4 h-1.5" />
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="lg" onClick={() => paginate(-1)} aria-label="Previous card">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <p className="text-lg font-semibold text-muted-foreground w-24 text-center">
                            {cardIndex + 1} / {cards.length}
                        </p>
                        <Button variant="outline" size="lg" onClick={() => paginate(1)} aria-label="Next card">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};