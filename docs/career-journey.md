# Career & Experience — phase 05

## A. Current architecture

The existing React `Career.tsx` contains five records, including the earlier Web Developer role and education record absent from the prompt's three-role reference. All original titles, organizations, dates, descriptions, highlights and tags are preserved verbatim. This includes the existing 40% claim and 8.1/10.0 CGPA; neither was invented or independently verified in this task.

The former implementation used six ScrollTriggers, measured progress across the entire section and retained three columns down to 768px. The new implementation uses one component-scoped ScrollTrigger integrated with the existing GSAP ScrollSmoother. There is no new dependency, canvas, pinning or scroll provider.

## B. Files modified

- `src/components/Career.tsx`: semantic role headings, editorial introduction, milestone measurement, active selection, scoped reveal lifecycle and section ending.
- `src/components/styles/Career.css`: responsive grid, typography, subtle rail/node treatment, readable tags, hover/focus/reduced-motion styles.
- `docs/qa/career/`: baseline, viewport screenshots and verification records.
- `docs/career-journey.md`: implementation report.

Checkpoint: `/tmp/sumitport-before-career-20261023.tar.gz`. Source comparison confirms 60 other source/model files unchanged. One additional selector in About.css completes the preceding About repair: the unavailable canvas must override Three.js inline display so the fallback image is visible. It does not change the normal portrait.

## C. Design improvements

The heading reads “03 / PROFESSIONAL JOURNEY” and “THE JOURNEY / SO FAR.” The desktop layout aligns professional identity, a thin central rail and detailed responsibilities. Tablet/mobile place the rail left of a single content column. Natural row heights accommodate every description and tag. The finishing caption is “Always building. Always learning.” Existing neighboring section layout is untouched.

## D. Interactive features

Rail endpoints are measured from actual node centers on refresh/resize. Progress follows those endpoints at 48% of viewport height, clamped to the track. The nearest milestone is emphasized in either scroll direction. Measurements are cached rather than recalculated per scroll frame. Selection uses existing semantic buttons with `aria-pressed`, Enter/Space and visible focus; selection never initiates scrolling or hides descriptions. Hover adds restrained company/node/separator emphasis. One-time IntersectionObserver reveals begin at 65% opacity, so content is never gated behind animation initialization.

## E. Responsive results

Browser matrix: 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×800 and 1440×600. Each viewport covers entrance, all five active milestones, reverse scrolling and the Projects boundary. Captures and numeric checks are saved in `docs/qa/career/`.

## F. Accessibility and performance

Ordered list, section heading, role h3 headings, machine-readable dates and complete visible descriptions preserve reading order. Keyboard selection does not move focus. Reduced-motion CSS disables reveals and smooth transitions. No new WebGL scene or dependency is introduced. One scoped trigger replaces six; one ResizeObserver refreshes cached rail geometry after actual size changes. Observers, timers and GSAP context are cleaned up on unmount. No frame-rate claim is made.

## G. Regression protection

Baseline and after captures cover Hero/navbar, About, What I Do, Career and My Work. Text snapshots preserve all protected non-Hero section content. Career implementation changes are confined to the two Career source files; the one-line fallback correction belongs to the preceding About repair. Hero/About/workstation camera, skeleton, material and animation code are untouched.

## H. Build and testing

Production build, TypeScript, ESLint and whitespace checks pass. The existing Vite large-chunk advisory remains. The repository has no configured automated test script. Browser verification covers active-state alignment, bounded progress, reverse scrolling, all original record fields, no horizontal overflow, zero Career canvases, and separation from Projects. All 40 milestone states passed across eight viewports; the normal-browser run recorded zero runtime, console or HTTP errors. Enter selection, reload at Career and protected section text comparisons passed. Additional checks passed for Enter/Space selection, refresh, touch, reduced motion (zero active animations) and resizing inside Career, with zero browser errors.

## I. Remaining issues

Viewport tests use Chromium emulation, not physical devices or cross-browser certification. Existing career claims are preserved as repository data, not externally audited. The existing bundle-size advisory remains outside this section's scope.

## J. Phase 06 readiness

Career is self-contained and ready for review before a separate My Work redesign. Phase 06 has not been started.

Local URL: http://127.0.0.1:5175/#career
