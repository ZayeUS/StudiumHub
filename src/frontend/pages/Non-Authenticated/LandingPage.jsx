import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Sparkles,
  Send,
  BookOpen,
  Layers,
  ClipboardCheck,
  Share2,
  ArrowRight,
  Menu,
  CheckCircle,
  Star,
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Reusable animated component
const MotionBox = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: 'easeOut', delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Navigation Bar Component
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { text: "Features", path: "#features" },
    { text: "Testimonials", path: "#testimonials" },
    { text: "Pricing", path: "#pricing" },
    { text: "FAQ", path: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Sparkles className="h-7 w-7 mr-2 text-primary" />
          <Link to="/" className="mr-6 font-bold text-xl hover:opacity-80">
            StudiumHub
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <a key={item.text} href={item.path} className="transition-colors hover:text-foreground/80 text-foreground/60">
              {item.text}
            </a>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
                <div className="flex flex-col space-y-3 mt-6">
                  {navItems.map((item) => (
                    <a key={item.text} href={item.path} onClick={() => setIsOpen(false)} className="font-medium text-lg text-foreground/70 hover:text-foreground">
                      {item.text}
                    </a>
                  ))}
                  <Separator className="my-4" />
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}><Link to="/login">Login</Link></Button>
                  <Button asChild onClick={() => setIsOpen(false)}><Link to="/signup">Get Started</Link></Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Landing Page Component
const LandingPage = () => {
    // Content for the page
    const howItWorksSteps = [
        { icon: <UploadCloud className="h-8 w-8" />, title: "Upload Your Material", description: "Simply upload any PDF document—textbooks, lecture notes, or articles." },
        { icon: <Sparkles className="h-8 w-8" />, title: "AI Generates Content", description: "Our AI analyzes the text to create summaries, flashcards, and quizzes in seconds." },
        { icon: <Send className="h-8 w-8" />, title: "Share with Students", description: "Share your new interactive course module with a single public link." },
    ];

    const features = [
        { icon: <BookOpen />, title: "AI-Powered Summaries", description: "Distill complex topics into easy-to-understand summaries and key takeaways, saving students valuable study time." },
        { icon: <Layers />, title: "Interactive Flashcards", description: "Automatically generate flashcards for key terms and concepts to help students master the material through active recall." },
        { icon: <ClipboardCheck />, title: "Custom Quizzes", description: "Instantly create quizzes based on the study material to test comprehension and prepare students for exams." },
        { icon: <Share2 />, title: "Effortless Sharing", description: "Easily share your generated course modules with students via a public link—no logins required for them." },
    ];

    const testimonials = [
        { quote: "StudiumHub saved me hours of prep time. I can create a full module with study aids in under 10 minutes. It's a game-changer.", name: "Sarah J.", role: "High School Teacher" },
        { quote: "My students love the interactive flashcards. Their engagement and test scores have noticeably improved since we started using StudiumHub.", name: "Dr. Michael Chen", role: "University Professor" },
        { quote: "As a corporate trainer, this tool is invaluable for quickly turning dense manuals into digestible learning modules. Highly recommended!", name: "David L.", role: "Corporate Trainer" },
    ];

    const faqItems = [
        { question: "What kind of files can I upload?", answer: "Currently, StudiumHub supports PDF files. We are working on expanding to other formats like .docx and web articles in the future." },
        { question: "How does the AI generate the content?", answer: "Our platform uses advanced large language models to analyze the text, identify key concepts, and generate pedagogically sound summaries, flashcards, and questions based on the provided material." },
        { question: "Can my students access the materials without an account?", answer: "Yes! Once you create a course module, you can share a public link. Your students can access the summary, flashcards, and quizzes without needing to sign up." },
        { question: "Is there a limit to how many courses I can create?", answer: "Our free plan allows you to create a limited number of courses. Our Pro plan offers unlimited course creation and other advanced features. Check out our pricing section for more details." },
    ];

  return (
    <div className="bg-background text-foreground">
      <NavBar />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)] dark:bg-grid-slate-700/30"></div>
            <div className="container px-4 text-center">
                <MotionBox>
                    <Badge variant="outline" className="mb-4 text-primary border-primary">The AI Assistant for Educators</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 leading-tight">
                        Create Engaging Courses in <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Minutes</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Upload your textbook, syllabus, or notes, and let our AI generate summaries, flashcards, and quizzes instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="font-semibold">
                            <Link to="/signup">Get Started - It's Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                    </div>
                </MotionBox>
            </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted/40">
            <div className="container px-4">
                <MotionBox className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
                    <p className="text-lg text-muted-foreground mt-3">Transform your documents into interactive courses in three simple steps.</p>
                </MotionBox>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {howItWorksSteps.map((step, index) => (
                        <MotionBox key={index} delay={index * 0.1}>
                            <Card className="h-full text-center bg-background/80">
                                <CardHeader>
                                    <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">{step.icon}</div>
                                    <CardTitle>{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent><p className="text-muted-foreground">{step.description}</p></CardContent>
                            </Card>
                        </MotionBox>
                    ))}
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
            <div className="container px-4">
                <MotionBox className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Teach Smarter</h2>
                    <p className="text-lg text-muted-foreground mt-3">Focus on teaching, not on tedious content creation.</p>
                </MotionBox>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <MotionBox key={index} delay={index * 0.1}>
                            <Card className="h-full bg-background/80">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg">{feature.icon}</div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent>
                            </Card>
                        </MotionBox>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-muted/40">
            <div className="container px-4">
                <MotionBox className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Educators Everywhere</h2>
                </MotionBox>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <MotionBox key={index} delay={index * 0.1}>
                            <Card className="h-full flex flex-col">
                                <CardContent className="pt-6 flex-grow">
                                    <p className="text-muted-foreground">"{testimonial.quote}"</p>
                                </CardContent>
                                <CardHeader className="flex-row items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{testimonial.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </CardHeader>
                            </Card>
                        </MotionBox>
                    ))}
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
            <div className="container max-w-3xl mx-auto px-4">
                <MotionBox className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
                </MotionBox>
                <Accordion type="single" collapsible>
                    {faqItems.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-28">
            <div className="container max-w-3xl mx-auto px-4 text-center">
                <MotionBox>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Revolutionize Your Course Creation?</h2>
                    <p className="text-lg text-muted-foreground mt-4 mb-8">Join hundreds of educators and start creating smarter, more engaging learning materials today.</p>
                    <Button asChild size="lg" className="font-semibold">
                        <Link to="/signup">Sign Up Now - It's Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </MotionBox>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/40">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudiumHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
