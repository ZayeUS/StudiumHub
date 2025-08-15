// src/frontend/pages/Authenticated/QuizEditorPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getData, postData, putData, deleteData } from '../../utils/BackendRequestHelper';
import { Loader2, ChevronLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Reusable form for adding/editing questions
// Reusable form for adding/editing questions
const QuestionForm = ({ quizId, question, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      question_text: question?.question_text || '',
      options: question?.options || ['', '', '', ''],
      // start with nothing selected even when editing
      correct_answer: ''
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
  
    const handleOptionChange = (index, value) => {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
    };
  
    const handleSubmit = async () => {
      if (!formData.correct_answer) {
        toast({
          variant: "destructive",
          title: "Pick the correct answer",
          description: "Click the radio to highlight the correct option before saving."
        });
        return;
      }
      setLoading(true);
      try {
        const payload = { ...formData, quiz_id: quizId };
        if (question?.question_id) {
          await putData(`/questions/${question.question_id}`, payload);
          toast({ title: "Question Updated" });
        } else {
          await postData('/questions', payload);
          toast({ title: "Question Added" });
        }
        onSave();
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to save question." });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="question_text">Question</Label>
          <Input
            id="question_text"
            value={formData.question_text}
            onChange={e => setFormData({ ...formData, question_text: e.target.value })}
          />
        </div>
  
        <div className="space-y-2">
          <Label>Options (click the radio to highlight the correct one)</Label>
          <p className="text-xs text-muted-foreground">Nothing is selected by default.</p>
          {/* Use undefined so none are highlighted initially */}
          <RadioGroup
            value={formData.correct_answer || undefined}
            onValueChange={value => setFormData({ ...formData, correct_answer: value })}
          >
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`option-${i}`} />
                <Input
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            ))}
          </RadioGroup>
        </div>
  
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Question
          </Button>
        </DialogFooter>
      </div>
    );
  };
  


export const QuizEditorPage = () => {
    const { quizId, courseId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingQuestion, setEditingQuestion] = useState(null); // Can be a question object or 'new'
    const { toast } = useToast();

    const fetchQuiz = useCallback(async () => {
        try {
            const data = await getData(`/quizzes/${quizId}`);
            setQuestions(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch quiz questions." });
        } finally {
            setLoading(false);
        }
    }, [quizId, toast]);

    useEffect(() => { setLoading(true); fetchQuiz(); }, [fetchQuiz]);

    const handleDelete = async (questionId) => {
        try {
            await deleteData(`/questions/${questionId}`);
            toast({ title: "Question Deleted" });
            fetchQuiz();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete question." });
        }
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <Button asChild variant="ghost" className="justify-start mb-4 -ml-4">
                <Link to={`/course/${courseId}`}><ChevronLeft className="mr-2 h-4 w-4" /> Back to Course</Link>
            </Button>

            <Dialog open={!!editingQuestion} onOpenChange={(isOpen) => !isOpen && setEditingQuestion(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingQuestion === 'new' ? 'Add New Question' : 'Edit Question'}</DialogTitle>
                        <DialogDescription>
                            Make changes to your question below. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <QuestionForm 
                        quizId={quizId} 
                        question={editingQuestion === 'new' ? null : editingQuestion}
                        onSave={() => { setEditingQuestion(null); fetchQuiz(); }}
                        onCancel={() => setEditingQuestion(null)}
                    />
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Editor</CardTitle>
                    <CardDescription>Add, edit, or remove questions for this quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={q.question_id} className="p-4 border rounded-lg flex justify-between items-start gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                <p className="text-sm text-green-600 mt-1">Correct Answer: {q.correct_answer}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(q.question_id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    <Button onClick={() => setEditingQuestion('new')} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add New Question
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};