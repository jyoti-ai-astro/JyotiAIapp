import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function LicensesPage() {
  return (
    <LegalPageShell
      eyebrow="Licenses"
      title="Open-source and third-party software."
      description="JyotiAI is built with software libraries and services created by many teams and communities. Their respective rights and licenses remain with their owners."
      updated="30 August 2026"
      sections={[
        {
          title: 'Open-source software',
          content: (
            <p>
              JyotiAI uses open-source packages as part of its application
              stack. Each package remains subject to the license distributed
              with that package or published by its rights holder.
            </p>
          ),
        },
        {
          title: 'Third-party services',
          content: (
            <p>
              Third-party platforms used for infrastructure, authentication,
              payments, AI capabilities, email delivery or other functions
              remain governed by their respective terms, policies and
              intellectual-property rights.
            </p>
          ),
        },
        {
          title: 'JyotiAI materials',
          content: (
            <p>
              JyotiAI branding, original interface design, original written
              material and proprietary application code are not converted into
              open-source works merely because the service uses open-source
              dependencies.
            </p>
          ),
        },
        {
          title: 'Notices',
          content: (
            <p>
              Where an applicable dependency license requires preservation of a
              copyright, attribution or license notice, those obligations apply
              according to that license. This page is not intended to replace
              notices distributed with individual dependencies.
            </p>
          ),
        },
      ]}
    />
  )
}
