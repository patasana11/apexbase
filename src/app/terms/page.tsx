import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Terms of Service - ApexBase',
  description: 'ApexBase - Terms of Service and Conditions',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 15, 2025</p>
      </div>

      <Separator className="my-6" />

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
        <p>
          These Terms of Service constitute a legally binding agreement made between you and ApexBase ("we," "us," or "our"),
          concerning your access to and use of our website and services.
        </p>
        <p>
          You agree that by accessing the Service, you have read, understood, and agree to be bound by all of these
          Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited
          from using the Service and you must discontinue use immediately.
        </p>
        <p>
          We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Service at
          any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these
          Terms of Service, and you waive any right to receive specific notice of each such change.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Services</h2>
        <p>
          ApexBase provides a Backend-as-a-Service (BaaS) platform with features including but not limited to: authentication and
          user management, database storage, serverless functions, API management, workflow automation, file storage,
          and analytics. The Service is subject to availability and may be modified, updated, or discontinued at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Subscriptions</h2>
        <p>
          Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring
          and periodic basis (monthly or annually), depending on the subscription plan you select.
        </p>
        <p>
          At the end of each period, your subscription will automatically renew under the exact same conditions unless
          you cancel it or we cancel it. You may cancel your subscription by contacting our customer support team.
        </p>
        <p>
          A valid payment method, including credit card, is required to process the payment for your subscription.
          You shall provide us with accurate and complete billing information.
        </p>
        <p>
          Should automatic billing fail to occur for any reason, we will issue an electronic invoice indicating that you
          must proceed manually, within a certain deadline date, with the full payment corresponding to the billing period.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Free Trial</h2>
        <p>
          We may, at our sole discretion, offer a subscription with a free trial for a limited period of time. You may
          be required to enter your billing information in order to sign up for the free trial.
        </p>
        <p>
          If you do enter your billing information when signing up for a free trial, you will not be charged by us until
          the free trial has expired. On the last day of the free trial period, unless you canceled your subscription,
          you will be automatically charged the applicable subscription fee for the type of subscription you have selected.
        </p>
        <p>
          At any time and without notice, we reserve the right to (i) modify the terms and conditions of the free trial
          offer, or (ii) cancel such free trial offer.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Activities</h2>
        <p>You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>

        <p>As a user of the Service, you agree not to:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
          <li>Make any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
          <li>Use the Service to advertise or offer to sell goods and services.</li>
          <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
          <li>Engage in unauthorized framing of or linking to the Service.</li>
          <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
          <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
          <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
          <li>Interfere with, disrupt, or create an undue burden on the Service or the networks or services connected to the Service.</li>
          <li>Attempt to bypass any measures of the Service designed to prevent or restrict access to the Service, or any portion of the Service.</li>
          <li>Use the Service in a manner inconsistent with any applicable laws or regulations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
        <p>
          The Service and its original content (excluding content provided by users), features, and functionality are
          and will remain the exclusive property of ApexBase and its licensors. The Service is protected by copyright,
          trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may
          not be used in connection with any product or service without the prior written consent.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. User Data</h2>
        <p>
          You own your data. We claim no intellectual property rights over the data you provide to the Service.
          Your profile and materials uploaded remain yours. However, by using the Service to send content, you agree
          that we can use your content to operate and provide the Service to you.
        </p>
        <p>
          You can export and delete your data from the Service at any time. Please note that some copies of your data
          may remain in our system as part of routine backups for a limited period.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, in no event shall ApexBase, its affiliates, directors, employees, agents,
          licensors, or service providers be liable for any indirect, incidental, special, consequential, or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Your access to or use of or inability to access or use the Service;</li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content,</li>
        </ul>
        <p>
          whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not
          we have been informed of the possibility of such damage.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of California, without
          giving effect to any principles of conflicts of law. Any dispute arising under or relating in any way to these
          Terms will be resolved exclusively in the federal or state courts located in San Francisco, California, and you
          agree to jurisdiction and venue in those courts.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <div className="mt-2">
          <p>ApexBase Inc.</p>
          <p>Email: legal@example.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
