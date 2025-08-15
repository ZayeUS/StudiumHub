// src/frontend/components/course/FlashcardView.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const cardVariants = {
    enter: (direction) => ({ opacity: 0, x: direction > 0 ? 300 : -300 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, opacity: 0, x: direction < 0 ? 300 : -300 }),
};

export const FlashcardView = ({ cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [cards]);

    if (!cards || cards.length === 0) {
        return <p className="text-center text-muted-foreground py-10">No flashcards available for this module.</p>;
    }

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + newDirection + cards.length) % cards.length);
    };
    
    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="flex flex-col h-[60vh] justify-between">
            <div className="flex-grow flex items-center justify-center relative">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        className="w-full max-w-lg h-80 absolute"
                        style={{ perspective: '1000px' }}
                    >
                        <motion.div
                            className="w-full h-full cursor-pointer"
                            style={{ transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => setIsFlipped(f => !f)}
                        >
                            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}><Card className="w-full h-full flex items-center justify-center text-center p-6"><p className="text-2xl font-bold">{currentCard?.term}</p></Card></div>
                            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}><Card className="w-full h-full flex items-center justify-center text-center p-6"><p className="text-xl text-muted-foreground">{currentCard?.definition}</p></Card></div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="mt-8">
                <Progress value={progress} className="w-full mb-4" />
                <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="lg" onClick={() => paginate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
                    <p className="text-lg font-semibold text-muted-foreground w-20 text-center">{currentIndex + 1} / {cards.length}</p>
                    <Button variant="outline" size="lg" onClick={() => paginate(1)}><ArrowRight className="h-5 w-5" /></Button>
                </div>
            </div>
        </div>
    );
};