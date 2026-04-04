/**
 * E2E test helpers — bypass GDPR consent + onboarding modals.
 * ZERO MOCK: we pre-accept consent and mark onboarding as seen,
 * exactly as a returning user would have in localStorage.
 *
 * Uses page.addInitScript() so localStorage is set BEFORE React mounts.
 */

/**
 * Set all required localStorage flags to skip blocking modals.
 * Call BEFORE any page.goto().
 */
export async function setupUser(page) {
  await page.addInitScript(() => {
    // GDPR consent (gdprService key)
    localStorage.setItem('elab_gdpr_consent', JSON.stringify({
      status: 'accepted',
      age: 14,
      timestamp: new Date().toISOString(),
      analyticsAnonymized: true,
      version: '1.0',
    }));
    // ConsentBanner key
    localStorage.setItem('elab_consent_v2', 'accepted');
    // Onboarding tooltip already seen
    localStorage.setItem('elab_onboarding_seen', 'true');
  });
}

/** Alias for backwards compatibility */
export const acceptConsent = setupUser;

/**
 * Set active volume (skips VolumeChooser in non-prova mode).
 */
export async function setVolume(page, volume = '1') {
  await page.addInitScript((vol) => {
    localStorage.setItem('elab_active_volume', vol);
  }, volume);
}

/**
 * Simulate a teacher user session.
 */
export async function setTeacherUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('elab_user', JSON.stringify({
      id: 'test-teacher-e2e',
      email: 'teacher@test.elab',
      role: 'teacher',
      firstName: 'Prof',
      lastName: 'Test',
    }));
  });
}
