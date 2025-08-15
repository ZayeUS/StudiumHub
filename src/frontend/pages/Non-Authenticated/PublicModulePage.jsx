// src/frontend/pages/Non-Authenticated/PublicModulePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { Loader2, ArrowLeft, BookOpen, Star, BrainCircuit, HelpCircle, Layers, Sparkles, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// New Animated AI Button Component
const ExplainMoreButton = ({ onClick, isLoading, isExpanded }) => {
    return (
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="spinner"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"
              style={{ zIndex: 2 }}
            />
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={isLoading}
          className="relative h-9 w-9 rounded-full group transition-all duration-300 ease-in-out overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isExpanded ? 'close' : 'sparkle'}
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              {isExpanded ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
    );
  };

export const PublicModulePage = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);

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

  const handleExplainMore = async (concept) => {
    if (expandedExplanations[concept]) {
      setExpandedExplanations((prev) => {
        const newState = { ...prev };
        delete newState[concept];
        return newState;
      });
      return;
    }

    setLoadingExplanation(concept);
    try {
      const response = await postData(`/modules/${moduleId}/explain`, { concept }, false);
      setExpandedExplanations((prev) => ({
        ...prev,
        [concept]: response.explanation,
      }));
    } catch (err) {
      console.error('Failed to get detailed explanation:', err);
    } finally {
      setLoadingExplanation(null);
    }
  };

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
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="mr-3 h-6 w-6 text-primary" /> Summary</h2>
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center"><BrainCircuit className="mr-3 h-6 w-6 text-primary" /> Key Concepts</h2>
                <Accordion type="multiple" className="w-full">
                  {keyConcepts?.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="font-semibold text-left text-lg hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-2">
                            <span>{item.concept}</span>
                            <ExplainMoreButton
                                onClick={(e) => { e.stopPropagation(); handleExplainMore(item.concept); }}
                                isLoading={loadingExplanation === item.concept}
                                isExpanded={!!expandedExplanations[item.concept]}
                            />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base">
                        {item.details}
                        <AnimatePresence>
                          {expandedExplanations[item.concept] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 border rounded-lg bg-background/50 relative">
                                <div className="absolute top-2 left-2 h-5 w-5 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                    <Sparkles className="h-3 w-3" />
                                </div>
                                <p className="text-sm pl-7">{expandedExplanations[item.concept]}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              <Separator />

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