
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQs = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">How do I create an event?</AccordionTrigger>
              <AccordionContent>
                To create an event, sign in to your account and click on the "Create Event" button. Fill in the event details like title, description, date, time, location, and optionally upload an image. Once you've completed all the required fields, click "Create Event" to publish it.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">Can I edit my event after publishing it?</AccordionTrigger>
              <AccordionContent>
                Yes, you can edit your event after publishing. Go to your Dashboard, find the event you want to edit, and click the "Edit" button. Make your changes and save them. All attendees will be notified of any significant changes to the event details.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">How do I register for an event?</AccordionTrigger>
              <AccordionContent>
                To register for an event, navigate to the event page and click the "Register" or "RSVP" button. You may need to provide some information and confirm your registration. Once registered, you'll receive a confirmation email with details about the event.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">Is there a limit to how many events I can create?</AccordionTrigger>
              <AccordionContent>
                No, there's no limit to the number of events you can create with your EventEase account. You can create as many events as you need for your organization or personal use.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">How do I cancel my event?</AccordionTrigger>
              <AccordionContent>
                To cancel an event, go to your Dashboard, find the event you want to cancel, and select the "Cancel Event" option. You'll be asked to confirm the cancellation and provide a reason that will be shared with registered attendees. All attendees will receive a notification about the cancellation.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">Can I create private events?</AccordionTrigger>
              <AccordionContent>
                Yes, when creating an event, you can set it as "Private." Private events won't appear in public listings and can only be accessed through a direct link that you can share with your intended guests.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">How do I contact support?</AccordionTrigger>
              <AccordionContent>
                If you need assistance, you can contact our support team by emailing support@eventease.com. Our team is available Monday through Friday, 9 AM to 5 PM PST, and will respond to your inquiry within 24 hours.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Didn't find what you're looking for? Contact our support team at{" "}
            <a href="mailto:support@eventease.com" className="text-primary hover:underline">
              support@eventease.com
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default FAQs;
