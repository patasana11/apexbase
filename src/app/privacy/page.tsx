import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Privacy Policy - ApexBase',
  description: 'ApexBase - Privacy Policy and Data Handling Practices',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 15, 2025</p>
      </div>

      <Separator className="my-6" />

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
        <p>
          ApexBase ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our
          service.
        </p>
        <p>
          We reserve the right to make changes to this Privacy Policy at any time and for any reason.
          We will alert you about any changes by updating the "Last updated" date of this Privacy Policy.
          You are encouraged to periodically review this Privacy Policy to stay informed of updates.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Collection of Your Information</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>

        <h3 className="text-xl font-medium mt-6 mb-3">Personal Data</h3>
        <p>
          Personally identifiable information, such as your name, email address, and telephone number,
          that you voluntarily give to us when you register with the service or when you choose to
          participate in various activities related to the service. You are under no obligation to
          provide us with personal information of any kind, however your refusal to do so may prevent
          you from using certain features of the service.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Derivative Data</h3>
        <p>
          Information our servers automatically collect when you access the service, such as your IP
          address, your browser type, your operating system, your access times, and the pages you have
          viewed directly before and after accessing the service.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Financial Data</h3>
        <p>
          Financial information, such as data related to your payment method (e.g., valid credit card
          number, card brand, expiration date) that we may collect when you purchase, order, return,
          exchange, or request information about our services. We store only very limited, if any,
          financial information that we collect. Otherwise, all financial information is stored by our
          payment processor, Paddle, and you are encouraged to review their privacy policy and contact
          them directly for responses to your questions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and
           customized experience. Specifically, we may use information collected about you via the service to:</p>
        <ul className="list-disc pl-6 my-4">
          <li>Create and manage your account.</li>
          <li>Process payments and refunds.</li>
          <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
          <li>Deliver targeted advertising, newsletters, and other information regarding promotions and the service to you.</li>
          <li>Email you regarding your account or order.</li>
          <li>Enable user-to-user communications.</li>
          <li>Fulfill and manage purchases, orders, payments, and other transactions related to the service.</li>
          <li>Generate a personal profile about you to make future visits to the service more personalized.</li>
          <li>Increase the efficiency and operation of the service.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the service.</li>
          <li>Notify you of updates to the service.</li>
          <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
          <li>Respond to product and customer service requests.</li>
          <li>Send you marketing and promotional communications.</li>
          <li>Solicit support for the service.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Disclosure of Your Information</h2>
        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>

        <h3 className="text-xl font-medium mt-6 mb-3">By Law or to Protect Rights</h3>
        <p>
          If we believe the release of information about you is necessary to respond to legal process, to
          investigate or remedy potential violations of our policies, or to protect the rights, property, and
          safety of others, we may share your information as permitted or required by any applicable law, rule,
          or regulation.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Third-Party Service Providers</h3>
        <p>
          We may share your information with third parties that perform services for us or on our behalf,
          including payment processing, data analysis, email delivery, hosting services, customer service, and
          marketing assistance.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Business Transfers</h3>
        <p>
          If we or our subsidiaries are involved in a merger, acquisition, or asset sale, your information may
          be transferred. We will provide notice before your information is transferred and becomes subject
          to a different Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal
          information. While we have taken reasonable steps to secure the personal information you provide to us,
          please be aware that despite our efforts, no security measures are perfect or impenetrable, and no
          method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at:
        </p>
        <div className="mt-2">
          <p>ApexBase Inc.</p>
          <p>Email: privacy@example.com</p>
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
