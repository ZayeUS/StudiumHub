// src/frontend/pages/Non-Authenticated/PublicModulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
// Corrected: Added Layers to the import
import { Loader2, ArrowLeft, BookOpen, Star, BrainCircuit, HelpCircle, Layers } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

export const PublicModulePage = () => {
    const { moduleId } = useParams();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchModule = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getData(`/modules/${moduleId}`);
            setModule(data);
        } catch (err) {
            setError('Could not load module content.');
        } finally {
            setLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchModule();
    }, [fetchModule]);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
    }

    const { summary, keyConcepts, takeaways } = module?.ai_summary || {};

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="container max-w-4xl mx-auto py-8 md:py-12 px-4">
                <div className="mb-6">
                    <Button asChild variant="outline">
                        <Link to={`/course/public/${module?.course_id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Course Modules
                        </Link>
                    </Button>
                </div>

                <motion.div initial="hidden" animate="visible" variants={itemVariants}>
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-4xl font-extrabold tracking-tight">{module?.title}</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground pt-2">
                                Study the material below, then test your knowledge.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Summary Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="mr-3 h-6 w-6 text-primary" /> Summary</h2>
                                <p className="text-muted-foreground leading-relaxed">{summary}</p>
                            </section>

                            <Separator />

                            {/* Key Concepts Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4 flex items-center"><BrainCircuit className="mr-3 h-6 w-6 text-primary" /> Key Concepts</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {keyConcepts?.map((item, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger className="font-semibold text-left text-lg">{item.concept}</AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground text-base">
                                                {item.details}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </section>
                            
                            <Separator />
                            
                            {/* Takeaways Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4 flex items-center"><Star className="mr-3 h-6 w-6 text-primary" /> Important Takeaways</h2>
                                <ul className="space-y-3">
                                    {takeaways?.map((item, index) => (
                                        <li key={index} className="flex items-start p-3 bg-background rounded-lg">
                                           <span className="text-primary mr-3 mt-1">&#10003;</span>
                                           <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Actions Sidebar */}
                        <aside className="lg:col-span-1">
                            <Card className="sticky top-24 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Test Your Knowledge</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {module.flashcard_deck_id && (
                                        <Button asChild size="lg" className="w-full">
                                            <Link to={`/course/${module.course_id}/deck/${module.flashcard_deck_id}`}>
                                                <Layers className="mr-2 h-4 w-4" /> Review Flashcards
                                            </Link>
                                        </Button>
                                    )}
                                    {module.quiz_id && (
                                        <Button asChild size="lg" variant="outline" className="w-full">
                                            <Link to={`/course/${module.course_id}/quiz/${module.quiz_id}`}>
                                                <HelpCircle className="mr-2 h-4 w-4" /> Take the Quiz
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};