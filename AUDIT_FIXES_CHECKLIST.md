# FULL-SYSTEM AUDIT - Issue Checklist

## STEP 0 - BUILD STATUS
- ✅ Build passes (exit code 0)
- ⚠️ Lint warnings (non-blocking, mostly unused vars in admin pages)

## STEP 1 - NAVIGATION & ROUTES
- [ ] Verify all header nav links point to real routes
- [ ] Remove broken/non-existent links

## STEP 2 - DOUBLE FOOTER
- [ ] Remove `<CosmicFooter />` from: updates, status, terms, contact, pricing, modules, features
- [ ] Remove `<FooterWrapper />` from: guru-page-client, premium-page-client, about-page-client, etc. (layout already has it)

## STEP 3 - HOMEPAGE 3D/SHADER
- [ ] Check for dead R3F imports in homepage
- [ ] Verify hero works without WebGL

## STEP 4 - GURU RECONNECT BUG
- [ ] Fix reconnect() to actually retry API call
- [ ] Ensure error states don't loop forever
- [ ] Add proper error recovery

## STEP 5 - MODULE PAGES
- [ ] Verify primary action buttons work
- [ ] Check API route connections

## STEP 6 - DESIGN CONSISTENCY
- [ ] Quick visual glitch fixes

