# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are UAE students (and families using a student account) who need a curriculum-matched tutor or course, plus tutors who list courses and run booked live classes. Home is one screen for both roles: it greets whichever signed-in user is present and must serve that role clearly, not as an afterthought.

## Product Purpose

Coach Academ is the UAE’s app-first tutoring platform. Signed-in users compare tutor-led courses, book live classes, and return to the next session from the phone. Success on Home is: know who you are in the product, see the next booked class when one exists, and reach a relevant course or destination in a few taps.

## Positioning

The product’s distinct mechanism is in-app matching and booking against the student’s actual school path — subject, grade, and exam board (IGCSE, IB, A-Level, American, CBSE, and others) — with KHDA-verified tutors, rather than a generic course catalog or a web-only directory.

## Operating Context

Used on iOS and Android phones in portrait, typically between school, homework, and the next live class. Course cards carry board, grade, tutor, price (AED), and enrollment. Booked classes carry subject, counterpart name (tutor or student), date, and time. The Home tab sits beside Community, Chat, and Profile.

## Capabilities and Constraints

Confirmed Home destinations that must remain reachable: Find Courses / all subjects (search), Schedule, Saved, Progress/Achievements, subject detail, booked-class jump to schedule, popular and browse course lists, community videos, and profile. APIs, auth, and real data stay in place. Information architecture on Home may be restructured. Upcoming booked classes take priority at the top when they exist; browsing is the next fast path. Dual `isTeacher` / student behavior stays. Do not invent live progress, streaks, ranks, or study-time stats that the Home APIs do not currently drive. Community videos and the Progress screen’s sample stats are existing demonstration content, not proof to expand.

## Brand Commitments

Name: Coach Academ (app slug Coach Academ / coach-academ; public site coachacadem.ae). Existing logo and splash assets live under `client/assets/images/`. Marketing claim in use: KHDA-verified tutors for UAE curricula. No additional visual identity was pinned in this interview; incumbent navy/Noto styling in the app is evidence of the current ship, not a locked redesign constraint.

## Evidence on Hand

Real: authenticated user metadata, subject search results, upcoming bookings, saved subjects, profile image. Do not fabricate verification counts, testimonials, leaderboard ranks, or weekly study hours on Home. Hardcoded community video URLs and the Progress screen’s static subject list are labeled demonstration material if shown.

## Product Principles

- One Home, two roles: the signed-in role is obvious and the next action fits that person.
- The next booked class outranks browsing when a class exists.
- Curriculum, grade, and board are how trust is scanned — not generic “course” chrome.
- Destinations stay reachable; layout and hierarchy may change.
- Show only proof the product actually has.
