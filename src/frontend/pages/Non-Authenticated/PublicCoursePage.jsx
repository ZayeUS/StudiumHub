// src/frontend/pages/Non-Authenticated/PublicCoursePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getData } from '../../utils/BackendRequestHelper';
import { Loader2, BookOpen, Layers, AlertCircle, ArrowRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
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
            <div className="container max-w-4xl mx-auto py-8 md:py-12 px-4">
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div variants={itemVariants}>
                        <Card className="mb-8 shadow-lg">
                            <CardHeader>
                                <Badge variant="secondary" className="w-fit mb-2">Course</Badge>
                                <CardTitle className="text-4xl font-extrabold tracking-tight">{course?.title}</CardTitle>
                                <CardDescription className="text-lg text-muted-foreground pt-2">
                                    A comprehensive overview of the modules included in this course.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <Layers className="mr-3 h-6 w-6 text-primary" />
                            Modules
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
                        {course?.modules.map((module, index) => (
                            <motion.div key={module.module_id} variants={itemVariants}>
                                <Card className="hover:border-primary transition-all duration-300">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-lg">{module.title}</p>
                                            <p className="text-sm text-muted-foreground">Module {index + 1}</p>
                                        </div>
                                        <Button asChild>
                                            {/* This will eventually link to the PublicModulePage */}
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