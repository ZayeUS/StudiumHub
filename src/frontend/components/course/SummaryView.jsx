// src/frontend/components/course/SummaryView.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Key, Lightbulb } from 'lucide-react';

export const SummaryView = ({ summary }) => {
  // The 'summary' prop is now a JSON object, not a Markdown string
  if (!summary || typeof summary !== 'object') {
    return <p className="text-muted-foreground">No structured summary available.</p>;
  }

  const { summary: overview, keyConcepts, takeaways } = summary;

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
            Summary
        </h3>
        <p className="text-muted-foreground">{overview}</p>
      </div>

      {/* Key Concepts Section */}
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
            <Key className="mr-2 h-5 w-5 text-blue-500" />
            Key Concepts and Structure
        </h3>
        <Accordion type="single" collapsible className="w-full">
            {keyConcepts && keyConcepts.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-semibold text-left">{item.concept}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        {item.details}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
      
      {/* Takeaways Section */}
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Important Takeaways
        </h3>
        <Card className="bg-background/50">
            <CardContent className="p-4">
                <ul className="space-y-3">
                    {takeaways && takeaways.map((item, index) => (
                        <li key={index} className="flex items-start">
                           <span className="text-green-500 mr-3 mt-1">&#10003;</span>
                           <span className="text-muted-foreground">{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};