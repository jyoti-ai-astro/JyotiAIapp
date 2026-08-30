import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Your data should serve your experience — not become the product."
      description="This notice explains the categories of information JyotiAI may process, why they are used, and the choices available to you."
      updated="30 August 2026"
      sections={[
        {
          title: 'Information you provide',
          content: (
            <>
              <p>
                JyotiAI may process account information such as your name and
                email address, along with birth details you provide for
                astrology calculations, including date, time and place of
                birth.
              </p>
              <p>
                When you choose features such as palmistry, face reading or
                aura analysis, you may also provide images for the requested
                analysis. Support requests and other information you submit
                directly may also be processed.
              </p>
            </>
          ),
        },
        {
          title: 'How information is used',
          content: (
            <>
              <p>
                Information is used to operate your account, calculate and
                retrieve your JyotiAI experiences, provide requested AI-assisted
                features, maintain service integrity, respond to support
                requests and administer purchases or subscriptions.
              </p>
              <p>
                We do not describe astrology or AI-generated output as a
                substitute for professional medical, legal, financial or other
                regulated advice.
              </p>
            </>
          ),
        },
        {
          title: 'Service providers',
          content: (
            <p>
              JyotiAI relies on third-party infrastructure and service
              providers to operate parts of the service. Depending on the
              feature used, this can include cloud authentication and data
              services, AI providers, payment infrastructure and transactional
              email delivery. Information is shared with providers only as
              needed to perform the relevant service.
            </p>
          ),
        },
        {
          title: 'Payments',
          content: (
            <p>
              Payment transactions are processed through payment-provider
              infrastructure. JyotiAI receives the transaction and entitlement
              information required to reconcile purchases and subscriptions;
              payment-card handling is performed by the payment provider rather
              than by JyotiAI application forms.
            </p>
          ),
        },
        {
          title: 'Retention and deletion',
          content: (
            <p>
              Information may be retained for as long as needed to provide the
              service, maintain account and transaction records, meet applicable
              obligations, resolve disputes and protect the service. Retention
              can vary by data type and context. You may contact JyotiAI about
              account or privacy requests through the contact channels provided
              on the site.
            </p>
          ),
        },
        {
          title: 'Security and limitations',
          content: (
            <p>
              JyotiAI uses technical and operational safeguards appropriate to
              the systems it operates, but no internet service can promise
              absolute security. Our Security page describes our approach
              without claiming certifications or controls that have not been
              independently established.
            </p>
          ),
        },
        {
          title: 'Your choices',
          content: (
            <p>
              You can choose what optional information and feature inputs you
              provide. Browser controls can also be used for cookies and local
              storage where applicable. Privacy or account-data requests can be
              submitted through JyotiAI&apos;s published contact channels.
            </p>
          ),
        },
        {
          title: 'Changes to this notice',
          content: (
            <p>
              We may update this notice as JyotiAI evolves. Material revisions
              will be reflected by updating this page and its last-updated date.
            </p>
          ),
        },
      ]}
    />
  )
}
