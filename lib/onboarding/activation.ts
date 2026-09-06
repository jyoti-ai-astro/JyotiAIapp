export type BirthProfileFormData = {
  dob?: string | null
  tob?: string | null
  pob?: string | null
  lat?: number | null
  lng?: number | null
}

export type BirthProfileRequirement = {
  key: 'dob' | 'tob' | 'pob' | 'verifiedLocation'
  label: string
  complete: boolean
}

export function getBirthProfileRequirements(
  formData: BirthProfileFormData
): BirthProfileRequirement[] {
  return [
    {
      key: 'dob',
      label: 'Date saved',
      complete: Boolean(formData.dob?.trim()),
    },
    {
      key: 'tob',
      label: 'Time saved',
      complete: Boolean(formData.tob?.trim()),
    },
    {
      key: 'pob',
      label: 'Place entered',
      complete: Boolean(formData.pob?.trim()),
    },
    {
      key: 'verifiedLocation',
      label: 'Location verified',
      complete:
        typeof formData.lat === 'number' &&
        Number.isFinite(formData.lat) &&
        typeof formData.lng === 'number' &&
        Number.isFinite(formData.lng),
    },
  ]
}

export function getBirthProfileActivationState(formData: BirthProfileFormData) {
  const requirements = getBirthProfileRequirements(formData)
  const missing = requirements.filter((requirement) => !requirement.complete)

  return {
    requirements,
    canContinue: missing.length === 0,
    missingLabels: missing.map((requirement) => requirement.label),
    completedCount: requirements.length - missing.length,
    totalCount: requirements.length,
  }
}

export function getKundaliActivationAction({
  profileIncomplete,
}: {
  profileIncomplete: boolean
}) {
  if (profileIncomplete) {
    return {
      href: '/onboarding',
      label: 'Complete birth profile',
    }
  }

  return {
    href: '/kundali',
    label: 'Open Kundali',
  }
}
