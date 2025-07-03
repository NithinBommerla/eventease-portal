
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Separator } from '@/components/ui/separator';

const TermsConditions = () => {
  const lastUpdated = "August 15, 2023";
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Terms & Conditions</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Last Updated: {lastUpdated}</p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using EventEase services, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing EventEase. The materials contained in EventEase are protected by applicable copyright and trademark law.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Permission is granted to temporarily use EventEase services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial)</li>
              <li>Attempt to decompile or reverse engineer any software contained in EventEase</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by EventEase at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-gray-700 dark:text-gray-300">
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Event Creation and Management</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By creating events on EventEase, you agree to provide accurate and complete information about the event. You are solely responsible for the content of your events and for ensuring that they comply with our policies and all applicable laws and regulations. EventEase reserves the right to remove any event that violates our policies or is otherwise objectionable.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitations</h2>
            <p className="text-gray-700 dark:text-gray-300">
              In no event shall EventEase or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use EventEase services, even if EventEase or an EventEase authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              EventEase reserves the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us at support@eventease.com.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;
