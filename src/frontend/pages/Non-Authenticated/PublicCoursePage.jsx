// src/frontend/pages/Non-Authenticated/PublicCoursePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, BookOpen, Layers, AlertCircle, ArrowRight, Library } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

export const PublicCoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getData(`/courses/public/${courseId}`);
            setCourse(data);
        } catch (err) {
            setError('Could not load course details. This course may not be public.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);
    
    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-muted/20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-2xl py-20 text-center">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button asChild className="mt-6">
                    <Link to="/">Go to Homepage</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-muted/20">
            <div className="container max-w-4xl mx-auto py-8 md:py-16 px-4">
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants} className="text-center mb-12">
                        <Badge variant="secondary" className="w-fit mb-4 text-sm font-medium">
                            <Library className="mr-2 h-4 w-4" />
                            Course Outline
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course?.title}</h1>
                        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                            Based on the document: <span className="font-medium text-foreground">{course.source_file_name}</span>
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <Layers className="mr-3 h-6 w-6 text-primary" />
                            Modules
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-3">
                        {course?.modules.map((module, index) => (
                            <motion.div key={module.module_id} variants={itemVariants}>
                                <Card className="bg-background/50 hover:bg-background transition-shadow duration-300 shadow-sm hover:shadow-md">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center h-10 w-10 bg-primary/10 text-primary rounded-lg font-bold text-lg">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{module.title}</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="ghost">
                                            <Link to={`/learn/module/${module.module_id}`}>
                                                Start Learning
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};