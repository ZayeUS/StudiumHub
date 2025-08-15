// src/frontend/pages/Authenticated/CourseDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { BookOpen, ChevronLeft, Plus, FileText, Loader2, AlertCircle, Layers, Sparkles, ClipboardList, Edit, PlayCircle } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Import the view components
import { SummaryView } from '../../components/course/SummaryView';
import { FlashcardView } from '../../components/course/FlashcardView';
import { QuizView } from '../../components/course/QuizView';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const AddModuleDialog = ({ courseId, onModuleAdded }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const handleAdd = async () => {
        if (!title) { toast({ variant: "destructive", title: "Title is required" }); return; }
        setLoading(true);
        try {
            await postData('/modules', { course_id: courseId, title });
            toast({ title: "Module Creation Started!" });
            setTimeout(() => { onModuleAdded(); }, 1000);
            setOpen(false);
            setTitle('');
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally { setLoading(false); }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Module</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add New Module</DialogTitle><DialogDescription>Enter the exact title of the chapter or section.</DialogDescription></DialogHeader><div className="py-4"><div className="space-y-2"><Label htmlFor="module-title">Module Title</Label><Input id="module-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chapter 1: The Cell" /></div></div><DialogFooter><Button onClick={handleAdd} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button></DialogFooter></DialogContent></Dialog>
    );
};

export const CourseDetailPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedModule, setSelectedModule] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [tabContent, setTabContent] = useState(null);
    const [generating, setGenerating] = useState('');
    const { toast } = useToast();

    const fetchCourse = useCallback(async (shouldResetSelection = false) => {
        try {
            const data = await getData(`/courses/${courseId}`);
            setCourse(data);
            if (shouldResetSelection || !selectedModule) {
                const firstModule = data.modules[0] || null;
                setSelectedModule(firstModule);
                if (firstModule) setActiveTab('summary');
            } else {
                 const updatedSelected = data.modules.find(m => m.module_id === selectedModule.module_id);
                 setSelectedModule(updatedSelected || data.modules[0] || null);
            }
        } catch (err) {
            setError('Could not load course details.');
        } finally {
            setLoading(false);
        }
    }, [courseId, selectedModule]);

    useEffect(() => { setLoading(true); fetchCourse(true); }, [courseId]);

    useEffect(() => {
        const fetchTabContent = async () => {
            if (!selectedModule) { setTabContent(null); return; }
            setTabContent(null);
            if (activeTab === 'flashcards' && selectedModule.flashcard_deck_id) {
                const cards = await getData(`/decks/${selectedModule.flashcard_deck_id}`);
                setTabContent(cards);
            } else if (activeTab === 'quiz' && selectedModule.quiz_id) {
                const quizData = await getData(`/quizzes/${selectedModule.quiz_id}`);
                setTabContent(quizData);
            }
        };
        fetchTabContent();
    }, [activeTab, selectedModule]);

    const handleGenerate = async (type) => {
        if (!selectedModule) return;
        setGenerating(type);
        try {
            await postData(`/modules/${selectedModule.module_id}/generate-${type}`, {});
            toast({ title: "Success!", description: `${type.charAt(0).toUpperCase() + type.slice(1)} generated.` });
            await fetchCourse();
            setActiveTab(type);
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: `Could not generate ${type}.` });
        } finally {
            setGenerating('');
        }
    };
    
    const handleModuleSelect = (module) => {
        setSelectedModule(module);
        setActiveTab('summary');
    };

    if (loading) { return <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>; }
    if (error) { return <div className="p-8 text-center"><AlertCircle className="mx-auto h-12 w-12 text-destructive" /><h2 className="mt-4 text-xl font-semibold">Error</h2><p className="mt-2 text-muted-foreground">{error}</p><Button onClick={() => fetchCourse(true)} className="mt-4">Try Again</Button></div>; }

    return (
        <div className="flex h-full">
            <aside className="hidden md:flex flex-col w-72 border-r bg-background/80 p-4">
                <Button asChild variant="ghost" className="justify-start mb-4"><Link to="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link></Button>
                <div className="flex items-center gap-3 mb-4"><BookOpen className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Course Outline</h2></div>
                <Separator />
                <div className="flex-grow py-4 space-y-2">
                    {course && course.modules.length > 0 ? (
                        course.modules.map(module => (
                            <Button key={module.module_id} variant={selectedModule?.module_id === module.module_id ? "secondary" : "ghost"} className="w-full justify-start h-auto text-wrap text-left" onClick={() => handleModuleSelect(module)}>
                                {module.title}
                            </Button>
                        ))
                    ) : ( <p className="text-sm text-muted-foreground px-3">No modules yet.</p> )}
                </div>
                <AddModuleDialog courseId={courseId} onModuleAdded={() => fetchCourse(true)} />
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                { !course ? <div className="flex h-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> :
                 (
                    <motion.div initial="hidden" animate="visible" variants={itemVariants}>
                        <Card className="bg-card/60 backdrop-blur-sm border-border/50 mb-8">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold">{course.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-2"><FileText className="h-4 w-4" /> Based on: {course.source_file_name}</CardDescription>
                            </CardHeader>
                        </Card>

                        <AnimatePresence mode="wait">
                            {selectedModule ? (
                                <motion.div key={selectedModule.module_id} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                        <h3 className="text-2xl font-bold break-words">{selectedModule.title}</h3>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button onClick={() => handleGenerate('flashcards')} disabled={generating === 'flashcards' || !!selectedModule.flashcard_deck_id}><Sparkles className="mr-2 h-4 w-4" />{selectedModule.flashcard_deck_id ? "Flashcards Created" : "Generate"}</Button>
                                            <Button onClick={() => handleGenerate('quiz')} disabled={generating === 'quiz' || !!selectedModule.quiz_id} variant="outline"><ClipboardList className="mr-2 h-4 w-4" />{selectedModule.quiz_id ? "Quiz Created" : "Generate"}</Button>
                                        </div>
                                    </div>
                                    
                                    {/* --- THIS IS THE RESPONSIVE FIX --- */}
                                    <div className="flex flex-col md:flex-row md:items-center border-b mb-4">
                                        <div className="flex-grow flex border-b md:border-b-0">
                                            <Button variant={'ghost'} className={cn("font-semibold rounded-none", activeTab === 'summary' && 'border-b-2 border-primary text-primary')} onClick={() => setActiveTab('summary')}>Summary</Button>
                                            {selectedModule.flashcard_deck_id && <Button variant={'ghost'} className={cn("font-semibold rounded-none", activeTab === 'flashcards' && 'border-b-2 border-primary text-primary')} onClick={() => setActiveTab('flashcards')}>Flashcards</Button>}
                                            {selectedModule.quiz_id && <Button variant={'ghost'} className={cn("font-semibold rounded-none", activeTab === 'quiz' && 'border-b-2 border-primary text-primary')} onClick={() => setActiveTab('quiz')}>Quiz</Button>}
                                        </div>
                                        {activeTab === 'quiz' && selectedModule.quiz_id && (
                                            <div className="py-2 md:py-0">
                                                <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
                                                    <Link to={`/course/${course.course_id}/quiz/${selectedModule.quiz_id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Quiz
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <AnimatePresence mode="wait">
                                        <motion.div key={activeTab} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                            {activeTab === 'summary' && <SummaryView summary={selectedModule.ai_summary} />}
                                            {activeTab === 'flashcards' && tabContent && <FlashcardView cards={tabContent} />}
                                            {activeTab === 'quiz' && tabContent && <QuizView questions={tabContent} />}
                                            {activeTab !== 'summary' && !tabContent && <div className="flex h-40 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                                        </motion.div>
                                    </AnimatePresence>

                                </motion.div>
                            ) : (
                                 <Card className="text-center py-16 px-8 bg-background/50 border-2 border-dashed"><Layers className="mx-auto h-16 w-16 text-muted-foreground" /><h2 className="mt-6 text-2xl font-semibold">Start Building Your Course</h2><p className="mt-2 text-muted-foreground">Add a module to begin generating content.</p><div className="mt-6"><AddModuleDialog courseId={courseId} onModuleAdded={() => fetchCourse(true)} /></div></Card>
                            )}
                        </AnimatePresence>
                    </motion.div>
                 )
                }
            </main>
        </div>
    );
};