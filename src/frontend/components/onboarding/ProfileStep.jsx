// src/frontend/components/onboarding/ProfileStep.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { PersonStanding, Camera, Edit, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const panelSwap = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

const PhotoUpload = ({ onFileSelect, loading }) => {
    const [preview, setPreview] = useState(null);
  
    const onDrop = useCallback(
      (acceptedFiles) => {
        const file = acceptedFiles?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      },
      [onFileSelect]
    );
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 'image/jpeg': [], 'image/png': [] },
      multiple: false,
      disabled: loading,
    });
  
    return (
        <div className="flex flex-col items-center">
            <div
                {...getRootProps()}
                className={cn(
                'relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all',
                isDragActive ? 'border-primary bg-primary/10' : 'border-border',
                loading && 'opacity-70 pointer-events-none'
                )}
                aria-label="Upload profile photo"
            >
                <input {...getInputProps()} />
                <Avatar className="w-full h-full">
                <AvatarImage src={preview || undefined} alt="User avatar" />
                <AvatarFallback>
                    <PersonStanding className="w-12 h-12 text-muted-foreground" />
                </AvatarFallback>
                </Avatar>
                <div
                className={cn(
                    'absolute inset-0 w-full h-full bg-black/50 text-white flex flex-col items-center justify-center rounded-full transition-opacity',
                    preview ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                )}
                >
                {preview ? <Edit /> : <Camera />}
                <p className="text-xs mt-1">{preview ? 'Change' : 'Upload'}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Optional, but recommended.</p>
      </div>
    );
  };
  
export const ProfileStep = ({ onProfileComplete, loading }) => {
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required.';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onProfileComplete(form, avatarFile);
  };

  return (
    <motion.div variants={panelSwap} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <PhotoUpload onFileSelect={setAvatarFile} loading={loading} />
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} autoComplete="given-name" />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} autoComplete="family-name" />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
          </div>
        </div>
      </div>
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Your info is private. Edit anytime in Profile.
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end pt-2">
        <Button onClick={handleNext} size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};