import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function CookiesPage() {
  return (
    <LegalPageShell
      eyebrow="Cookies"
      title="How browser storage supports JyotiAI."
      description="This page describes cookies and similar browser technologies in practical terms without assuming tracking technologies that may not be deployed."
      updated="30 August 2026"
      sections={[
        {
          title: 'What these technologies are',
          content: (
            <p>
              Cookies and similar browser-storage technologies can store small
              pieces of information on or through your browser. They are
              commonly used for session continuity, preferences, security and
              application functionality.
            </p>
          ),
        },
        {
          title: 'How JyotiAI may use them',
          content: (
            <p>
              JyotiAI may use browser storage where necessary to support
              authentication, preserve application state, remember relevant
              preferences and maintain reliable service behavior.
            </p>
          ),
        },
        {
          title: 'Third-party services',
          content: (
            <p>
              Services integrated into JyotiAI may use their own technologies
              when required to provide authentication, payment or other
              requested functionality. Their handling of information is also
              governed by their own policies.
            </p>
          ),
        },
        {
          title: 'Your controls',
          content: (
            <p>
              Browser settings generally allow you to inspect, block or delete
              cookies and site data. Disabling storage that is necessary for
              authentication or application state may prevent parts of JyotiAI
              from working correctly.
            </p>
          ),
        },
        {
          title: 'Changes',
          content: (
            <p>
              If JyotiAI&apos;s use of browser technologies changes materially,
              this page can be updated to describe the current implementation.
            </p>
          ),
        },
      ]}
    />
  )
}
