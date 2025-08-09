import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle,
  Users,
  Shield,
  ArrowRight,
  Menu,
  ChevronDown,
  Star,
} from 'lucide-react';

// Shadcn UI
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

const MotionBox = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { text: "Features", path: "#features" },
    { text: "Pricing", path: "#pricing" },
    { text: "FAQ", path: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-primary" />
          <Link to="/" className="mr-6 font-bold text-lg hover:opacity-80">
            SoftwareTemplate
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <a key={item.text} href={item.path} className="transition-colors hover:text-foreground/80 text-foreground/60">
              {item.text}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3 mt-6">
                  {navItems.map((item) => (
                    <a key={item.text} href={item.path} onClick={() => setIsOpen(false)} className="font-medium text-lg text-foreground/70 hover:text-foreground">
                      {item.text}
                    </a>
                  ))}
                  <Separator className="my-4" />
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const LandingPage = () => {
  const features = [
    {
      title: "Launch Faster",
      description: "Pre-built authentication, billing, and database integration lets you focus on your core features.",
      icon: <Zap className="h-6 w-6 text-secondary-foreground" />
    },
    {
      title: "Scale Confidently",
      description: "Built on a modern, robust stack (React, Node, Postgres) ready to handle growth from day one.",
      icon: <Users className="h-6 w-6 text-secondary-foreground" />
    },
    {
      title: "Secure by Default",
      description: "Best practices for security, including soft deletes, audit logs, and secure authentication.",
      icon: <Shield className="h-6 w-6 text-secondary-foreground" />
    },
  ];

  const plans = [
    {
      name: "MVP Tier",
      price: "$500",
      period: "/ one-time",
      features: [
        "Full Source Code Access",
        "Stripe Billing Integration",
        "Priority Email Support (3 Months)"
      ],
      isPopular: true
    },
  ];

  const faqItems = [
    {
      question: "What do I get when I purchase the template?",
      answer: "You receive the complete source code for the entire project, including the React frontend, Node.js backend, and all database setup files."
    },
    {
      question: "Is this a one-time payment?",
      answer: "Yes! The purchase of the SoftwareTemplate is a one-time payment with no recurring fees to us."
    },
    {
      question: "What kind of support is included?",
      answer: "The MVP Tier comes with priority email support for 3 months to help with setup and configuration."
    }
  ];

  return (
    <div className="bg-background text-foreground">
      <NavBar />

      {/* Hero */}
      <section className="py-20 md:py-32 overflow-hidden relative">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <MotionBox>
            <Badge variant="outline" className="mb-4">Launch your SaaS in days, not months</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 leading-tight">
              The Modern Foundation for Your Next{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">SaaS Product</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A production-ready boilerplate with authentication, subscriptions, and a modern tech stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-semibold">
                <a href="#pricing">
                  Purchase Now <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-10">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
            </motion.div>
          </MotionBox>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <MotionBox className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Launch</h2>
          </MotionBox>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full bg-background/80">
                  <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container max-w-md mx-auto px-4">
          <MotionBox className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">One Price, All Features</h2>
          </MotionBox>
          <motion.div whileHover={{ y: -5 }}>
            <Card className="relative border-2 border-primary shadow-lg">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Full Access</Badge>
              <CardHeader>
                <CardTitle className="text-xl">{plans[0].name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold">{plans[0].price}</span>
                  <span className="ml-1 text-muted-foreground">{plans[0].period}</span>
                </div>
                <ul className="space-y-3">
                  {plans[0].features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full font-bold">Purchase Now</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-muted/40">
        <div className="container max-w-3xl mx-auto px-4">
          <MotionBox className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </MotionBox>
          <Accordion type="single" collapsible>
            {faqItems.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container text-center text-muted-foreground">
          <div className="flex justify-center mb-4 space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Rated 5 Stars by 100+ developers</span>
          </div>
          © {new Date().getFullYear()} SoftwareTemplate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
