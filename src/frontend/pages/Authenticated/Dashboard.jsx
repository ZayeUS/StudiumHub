// src/frontend/pages/Authenticated/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate
} from 'framer-motion';
import {
  Plus,
  ChevronRight,
  LayoutGrid,
  Activity,
  Users,
  DollarSign,
  Briefcase,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_PROJECTS = [
  { id: 1, name: 'AI Copywriter Pro', status: 'Active', lastUpdated: '3 hours ago', icon: Briefcase, color: 'text-blue-500' },
  { id: 2, name: 'Client Onboarding Portal', status: 'In Progress', lastUpdated: '1 day ago', icon: Briefcase, color: 'text-yellow-500' },
  { id: 3, name: 'Analytics Dashboard', status: 'On Hold', lastUpdated: '5 days ago', icon: Briefcase, color: 'text-orange-500' },
  { id: 4, name: 'Internal Wiki', status: 'Completed', lastUpdated: '2 weeks ago', icon: Briefcase, color: 'text-green-500' },
];

const MOCK_STATS = [
  { title: "Active Projects", value: 4, icon: Activity },
  { title: "Team Members", value: 12, icon: Users },
  { title: "Monthly Revenue", value: 2450, isCurrency: true, icon: DollarSign },
];

// AnimatedCounter using useMotionValue + animate
const AnimatedCounter = ({ value, isCurrency = false }) => {
  const [count, setCount] = useState(0);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    // animate the motion value from current to target
    const animation = animate(motionVal, value, {
      duration: 1.5,
      ease: 'easeOut'
    });
    // subscribe to changes
    const unsubscribe = motionVal.onChange(v => {
      setCount(Math.round(v));
    });
    // cleanup
    return () => {
      unsubscribe();
      animation.stop();
    };
  }, [value, motionVal]);

  return (
    <span>
      {isCurrency && '$'}
      {count.toLocaleString()}
    </span>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const StatCard = ({ stat }) => (
  <Card>
    <CardHeader className="flex items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
      <stat.icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        <AnimatedCounter value={stat.value} isCurrency={stat.isCurrency} />
      </div>
    </CardContent>
  </Card>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.2 }}
      className="flex flex-col items-center"
    >
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <LayoutGrid className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to your workspace!</h2>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        This is where your projects will live. Get started by creating your first one.
      </p>
      <Button size="lg">
        <Plus className="mr-2 h-5 w-5" /> Create New Project
      </Button>
    </motion.div>
  </div>
);

export function Dashboard() {
  const { profile } = useUserStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadgeVariant = status => {
    switch (status) {
      case 'Active':      return 'default';
      case 'In Progress': return 'secondary';
      case 'On Hold':     return 'destructive';
      case 'Completed':   return 'outline';
      default:            return 'secondary';
    }
  };

  return (
    <motion.div
      className="h-full p-4 md:p-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here’s what’s happening with your projects today.
          </p>
        </div>
        <Button className="hidden md:flex">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </motion.header>

      {/* Stats */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3">
        {MOCK_STATS.map(stat => (
          <motion.div key={stat.title} variants={itemVariants}>
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Projects */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>
              An overview of all your current and past projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState />
                </motion.div>
              ) : (
                <motion.div key="projects" className="space-y-4">
                  {projects.map((project, i) => (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center p-3 -m-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="mr-4 bg-muted p-2 rounded-lg">
                          <project.icon className={cn("h-6 w-6", project.color)} />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.lastUpdated}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="ml-4">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
