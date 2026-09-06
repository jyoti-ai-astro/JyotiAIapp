import assert from 'node:assert/strict'

import {
  getBirthProfileActivationState,
  getBirthProfileRequirements,
  getKundaliActivationAction,
} from '../lib/onboarding/activation'

function testIncompleteProfileExplainsMissingFields() {
  const state = getBirthProfileActivationState({
    dob: '1990-01-01',
    tob: '',
    pob: 'Delhi',
  })

  assert.equal(state.canContinue, false)
  assert.equal(state.completedCount, 2)
  assert.deepEqual(state.missingLabels, ['Time saved', 'Location verified'])
}

function testVerifiedCoordinatesEnableContinue() {
  const state = getBirthProfileActivationState({
    dob: '1990-01-01',
    tob: '12:30',
    pob: 'Delhi, India',
    lat: 28.6139,
    lng: 77.209,
  })

  assert.equal(state.canContinue, true)
  assert.equal(state.completedCount, 4)
  assert.deepEqual(state.missingLabels, [])
}

function testInvalidCoordinatesRemainIncomplete() {
  const requirements = getBirthProfileRequirements({
    dob: '1990-01-01',
    tob: '12:30',
    pob: 'Delhi, India',
    lat: Number.NaN,
    lng: 77.209,
  })

  const locationRequirement = requirements.find(
    (requirement) => requirement.key === 'verifiedLocation'
  )

  assert.equal(locationRequirement?.complete, false)
}

function testIncompleteDashboardBlockerReturnsOnboardingAction() {
  const action = getKundaliActivationAction({ profileIncomplete: true })

  assert.deepEqual(action, {
    href: '/onboarding',
    label: 'Complete birth profile',
  })
}

function testCompleteDashboardBlockerReturnsKundaliAction() {
  const action = getKundaliActivationAction({ profileIncomplete: false })

  assert.deepEqual(action, {
    href: '/kundali',
    label: 'Open Kundali',
  })
}

function main() {
  testIncompleteProfileExplainsMissingFields()
  testVerifiedCoordinatesEnableContinue()
  testInvalidCoordinatesRemainIncomplete()
  testIncompleteDashboardBlockerReturnsOnboardingAction()
  testCompleteDashboardBlockerReturnsKundaliAction()
}

main()
