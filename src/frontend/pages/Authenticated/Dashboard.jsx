// src/frontend/pages/Authenticated/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../store/userStore';
import { getData, postData } from '../../utils/BackendRequestHelper';
import { useFileUpload } from '../../../hooks/useDirectUpload';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, FileText, UploadCloud, Loader2, AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } } };

// --- Dialog Components ---
const CreateCourseDialog = ({ materials, onCourseCreated }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [materialId, setMaterialId] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!title || !materialId) {
            toast({ variant: "destructive", title: "Missing fields", description: "Please provide a title and select a source material." });
            return;
        }
        setLoading(true);
        try {
            await postData('/courses', { title, source_material_id: materialId });
            toast({ title: "Course Created!", description: `${title} has been successfully created.` });
            onCourseCreated();
            setOpen(false);
            setTitle('');
            setMaterialId('');
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create the course." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-12 text-base" disabled={materials.length === 0}>
                    <Plus className="mr-2 h-5 w-5" /> Create New Course
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Course</DialogTitle>
                    <DialogDescription>
                        Create a structured course from one of your uploaded materials.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="course-title">Course Title</Label>
                        <Input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Biology 101" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="source-material">Source Material</Label>
                        <Select onValueChange={setMaterialId} value={materialId}>
                            <SelectTrigger id="source-material">
                                <SelectValue placeholder="Select a PDF..." />
                            </SelectTrigger>
                            <SelectContent>
                                {materials.map(m => <SelectItem key={m.material_id} value={m.material_id}>{m.file_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Course
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const UploadMaterialDialog = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [open, setOpen] = useState(false);
    const { upload, loading: isUploading, error: uploadError } = useFileUpload();
    const { toast } = useToast();
    const onDrop = useCallback((acceptedFiles) => { if (acceptedFiles[0]) { setFile(acceptedFiles[0]); } }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

    const handleUpload = async () => {
        if (!file) return;
        try {
            await upload(file, { purpose: 'course_material' });
            toast({ title: "Upload in Progress", description: `${file.name} is being processed and will appear shortly.` });
            onUploadComplete();
            setFile(null);
            setOpen(false);
        } catch (err) {
            toast({ variant: "destructive", title: "Upload Failed", description: err.message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="lg" className="h-12 text-base"><UploadCloud className="mr-2 h-5 w-5" /> Upload New Material</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Upload Course Material</DialogTitle><DialogDescription>Upload a PDF textbook, syllabus, or lecture notes to get started.</DialogDescription></DialogHeader><div {...getRootProps()} className={cn("mt-4 p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors", isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")}><input {...getInputProps()} /><UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />{file ? (<p className="mt-2 text-sm font-semibold">{file.name}</p>) : (<p className="mt-2 text-sm text-muted-foreground">{isDragActive ? "Drop the PDF here..." : "Drag 'n' drop a PDF here, or click to select"}</p>)}</div>{uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}<div className="mt-4 flex justify-end"><Button onClick={handleUpload} disabled={!file || isUploading}>{isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload & Process</Button></div></DialogContent></Dialog>
    );
};

// --- Main Dashboard Component ---
export function Dashboard() {
  const { profile, organization, role } = useUserStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
        setLoading(true);
        const data = await getData('/dashboard/teacher');
        setDashboardData(data);
    } catch (err) {
        setError('Could not load dashboard data.');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { if (role === 'admin') { fetchData(); } else { setLoading(false); } }, [role, fetchData]);

  if (role !== 'admin') { return (<div className="p-8"><h1 className="text-2xl font-bold">Student Dashboard Coming Soon!</h1></div>); }
  if (loading) { return (<div className="flex h-full w-full items-center justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>); }
  if (error) { return (<div className="p-8 text-center"><AlertCircle className="mx-auto h-12 w-12 text-destructive" /><h2 className="mt-4 text-xl font-semibold">Something went wrong</h2><p className="mt-2 text-muted-foreground">{error}</p><Button onClick={fetchData} className="mt-4">Try Again</Button></div>); }

  const hasContent = dashboardData?.recentMaterials?.length > 0 || dashboardData?.recentCourses?.length > 0;
  const readyMaterials = dashboardData?.recentMaterials.filter(m => m.status === 'ready') || [];

  return (
    <div className="h-full p-4 md:p-8 space-y-8">
      <motion.header variants={itemVariants} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome, {profile?.first_name || 'Teacher'}!
              </h1>
              <p className="text-muted-foreground">
                Here's your mission control for {organization?.name}.
              </p>
            </div>
          </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {!hasContent ? (
          <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="text-center py-16 px-8 bg-background/50 border-2 border-dashed"><FileText className="mx-auto h-16 w-16 text-muted-foreground" /><h2 className="mt-6 text-2xl font-semibold">Your Library is Empty</h2><p className="mt-2 text-muted-foreground">Get started by uploading your first course material.</p><div className="mt-6"><UploadMaterialDialog onUploadComplete={fetchData} /></div></Card>
          </motion.div>
        ) : (
          <motion.div key="dashboard-content" variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <UploadMaterialDialog onUploadComplete={fetchData} />
                  <CreateCourseDialog materials={readyMaterials} onCourseCreated={fetchData} />
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader><CardTitle>At a Glance</CardTitle></CardHeader>
                <CardContent className="space-y-2"><div className="flex justify-between items-center text-sm"><p className="text-muted-foreground">Content Library</p><p className="font-semibold">{dashboardData.stats.totalMaterials} files</p></div><div className="flex justify-between items-center text-sm"><p className="text-muted-foreground">Published Courses</p><p className="font-semibold">{dashboardData.stats.totalCourses} courses</p></div></CardContent>
              </Card>
            </motion.div>

            {dashboardData.recentCourses.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader><CardTitle>My Courses</CardTitle><CardDescription>Your most recently created courses.</CardDescription></CardHeader>
                        <CardContent><div className="space-y-2">{dashboardData.recentCourses.map(course => (
                            <Link to={`/course/${course.course_id}`} key={course.course_id}>
                                <div className="flex items-center justify-between p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="font-semibold">{course.title}</p>
                                            <p className="text-xs text-muted-foreground">Updated {new Date(course.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <div><ArrowRight className="h-4 w-4" /></div>
                                    </Button>
                                </div>
                            </Link>
                        ))}</div></CardContent>
                    </Card>
                </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader><CardTitle>Content Library</CardTitle><CardDescription>Your most recently uploaded materials.</CardDescription></CardHeader>
                <CardContent><div className="space-y-2">{dashboardData.recentMaterials.map(material => (<div key={material.material_id} className="flex items-center justify-between p-3 -m-3 rounded-lg hover:bg-accent/50 transition-colors"><div className="flex items-center gap-4"><FileText className="h-6 w-6 text-primary" /><div><p className="font-semibold">{material.file_name}</p><p className="text-xs text-muted-foreground">Uploaded {new Date(material.created_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-2 text-sm">{material.status === 'ready' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}<span className="capitalize">{material.status}</span></div></div>))}</div></CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}