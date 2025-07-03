
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Separator } from '@/components/ui/separator';

const RefundPolicy = () => {
  const lastUpdated = "August 15, 2023";
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Refund Policy</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Last Updated: {lastUpdated}</p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
            <p className="text-gray-700 dark:text-gray-300">
              This Refund Policy outlines our policies and procedures regarding refunds for events created and managed through the EventEase platform. We understand that circumstances may change, and we aim to provide a fair and transparent refund policy for all our users.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Event Organizer Refund Policies</h2>
            <p className="text-gray-700 dark:text-gray-300">
              As an event organizer on EventEase, you have the flexibility to set your own refund policy for your events. You can choose from the following options:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-3">
              <li><strong>Full Refund Policy:</strong> Attendees can receive a full refund if they cancel their registration up to a specified number of days before the event.</li>
              <li><strong>Partial Refund Policy:</strong> Attendees can receive a partial refund (a percentage of the ticket price) if they cancel their registration within a specified timeframe.</li>
              <li><strong>No Refund Policy:</strong> No refunds will be provided for canceled registrations.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              You must clearly communicate your refund policy to attendees during the registration process.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Attendee Refund Requests</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you are an attendee seeking a refund, you must follow the refund policy set by the event organizer. To request a refund:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-3">
              <li>Log in to your EventEase account</li>
              <li>Navigate to the event for which you're requesting a refund</li>
              <li>Click on the "Request Refund" button</li>
              <li>Complete the refund request form</li>
              <li>Submit your request</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Refund requests will be processed according to the event organizer's refund policy. Please note that EventEase may charge a processing fee for refunds, which will be deducted from the refund amount.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Canceled Events</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If an event is canceled by the organizer, attendees are generally entitled to a full refund of their ticket purchase. EventEase will automatically process refunds for canceled events within 10 business days. The event organizer is responsible for notifying attendees of the cancellation.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Rescheduled Events</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If an event is rescheduled by the organizer, attendees will receive notification of the new date and time. Attendees who cannot attend the rescheduled event may request a refund within 7 days of the rescheduling announcement. After this period, the event organizer's standard refund policy will apply.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Refund Processing Time</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Once a refund is approved, it will be processed within 5-10 business days. The time it takes for the funds to appear in your account depends on your payment method and financial institution.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions or concerns about our refund policy, please contact our support team at support@eventease.com. We are here to help you resolve any issues with your event registrations or refunds.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
