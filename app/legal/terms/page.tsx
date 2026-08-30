import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms for using JyotiAI."
      description="These terms set the ground rules for accounts, astrology and AI experiences, purchases, acceptable use and service availability."
      updated="30 August 2026"
      sections={[
        {
          title: 'Using JyotiAI',
          content: (
            <p>
              By accessing or using JyotiAI, you agree to use the service
              lawfully and in accordance with these terms. If you do not agree,
              do not use the service.
            </p>
          ),
        },
        {
          title: 'Accounts',
          content: (
            <p>
              You are responsible for information submitted through your
              account and for taking reasonable steps to protect access to it.
              You should provide accurate information where accuracy is
              necessary for calculations or account administration.
            </p>
          ),
        },
        {
          title: 'Astrology and AI output',
          content: (
            <>
              <p>
                JyotiAI provides astrology calculations, interpretations and
                AI-assisted experiences for informational, reflective and
                personal-use purposes.
              </p>
              <p>
                Outputs may be incomplete, probabilistic or incorrect. They
                should not be treated as guaranteed predictions or as medical,
                legal, financial, mental-health or other professional advice.
                Decisions remain your responsibility.
              </p>
            </>
          ),
        },
        {
          title: 'Purchases and subscriptions',
          content: (
            <p>
              Some features may require a subscription, ticket, entitlement or
              one-time purchase. Prices and the applicable purchase terms are
              presented before checkout. Payment processing may be performed by
              a third-party payment provider. Access is subject to successful
              payment verification and the entitlement associated with the
              purchase.
            </p>
          ),
        },
        {
          title: 'Acceptable use',
          content: (
            <p>
              You may not misuse JyotiAI, attempt unauthorized access, interfere
              with service operation, circumvent access or payment controls,
              upload unlawful or rights-infringing material, probe systems
              without authorization, or use the service to harm others.
            </p>
          ),
        },
        {
          title: 'Intellectual property',
          content: (
            <p>
              JyotiAI&apos;s software, branding, interface and original service
              content are protected by applicable intellectual-property laws.
              Third-party software remains subject to its respective licenses.
              You retain responsibility for content and materials you submit.
            </p>
          ),
        },
        {
          title: 'Service availability',
          content: (
            <p>
              JyotiAI may change, maintain, suspend or discontinue features as
              the product evolves. We do not promise uninterrupted or
              error-free operation, and third-party infrastructure can affect
              availability.
            </p>
          ),
        },
        {
          title: 'Liability',
          content: (
            <p>
              To the extent permitted by applicable law, JyotiAI is provided
              without guarantees about the accuracy of interpretive or
              AI-generated output. Nothing in these terms excludes rights or
              liabilities that cannot lawfully be excluded.
            </p>
          ),
        },
        {
          title: 'Changes',
          content: (
            <p>
              These terms may be updated as the service changes. The current
              version and last-updated date will be published on this page.
            </p>
          ),
        },
      ]}
    />
  )
}
