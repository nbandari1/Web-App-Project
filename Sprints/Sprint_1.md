# Sprint 1 – Discovery Deliverables

**Major Project – Planning and Design**
**Course Code:** BTS530
**Term:** 6
**Team #:** 4

---

## **Team Members**

| Student Name       | Student ID |
| ------------------ | ---------- |
| Nishnath Bandari   | 105202220  |
| Mattrey Kumar Rana | 116092222  |
| Nisarg Jaswal      | 116088220  |
| Ryan Tersigni      | 106982259  |

---

## **Theme:** Discovery & Shared Understanding

**Team Size:** 3–4 students
**Time Expectation:** ~12–15 hours per student over ~2.5 weeks

**Purpose:**
The purpose of Sprint 1 is to establish a shared understanding of the problem space before design and development begin. This document is a living artifact and may be refined in later sprints.

---

## **1. Stakeholders**

| Stakeholder                        | Type (Primary/Secondary) | Role / Relationship                                                     | Key Interests / Concerns                                  | Influence (H/M/L) |
| ---------------------------------- | ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------- | ----------------- |
| Users                              | Primary                  | People who are interested in tracking their usage                       | Easy-to-use interface, privacy, and data sync             | High              |
| API Providers                      | Secondary                | Provide external data through public APIs                               | Proper API usage and compliance with ToA                  | Medium            |
| Dev Team                           | Primary                  | Designers, developers, and testers for building and maintaining the app | Clear sprint planning, stable API                         | High              |
| Hosting Provider                   | Secondary                | Hosts the web app and manages uptime                                    | Reliable infrastructure, cost efficiency, resource limits | High              |
| Potential Partners and Competitors | Secondary                | Future collaborations                                                   | Exposure and increased traffic for app usage              | Low               |

---

## **2. Personas**

| Name      | Persona Type | Role                                            | Goals                                                                      | Pain Points                                                         | Technical Comfort | Key Scenarios                                                                                              |
| --------- | ------------ | ----------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| John Doe  | Primary      | College student and gamer                       | Wants one place to see game progress, anime watchlists, and personal tasks | Constantly switching between multiple apps                          | High              | Links Steam and MAL accounts to track what he’s been doing; adds study reminders and tasks                 |
| Jane Dowe | Primary      | Working professional who enjoys anime and music | Wants a dashboard that helps her unwind and organize her hobbies           | Finds it hard to remember where she left off on different platforms | Medium            | Connects Spotify to listen to music while completing tasks and uses MAL to track shows she’s been watching |

---

## **3. Functional Requirements**

| ID    | Requirement Description                                                                                                          | Related Persona(s)                  | Priority (H/M/L) |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------- |
| FR-01 | The system must allow users to authenticate and link external accounts (Steam, MAL, Spotify).                                    | Gamer, Anime Fan, Music Listener    | H                |
| FR-02 | The system must retrieve and display user activity data from linked platforms (e.g., playtime, anime progress, listening stats). | Gamer, Anime Fan, Music Listener    | H                |
| FR-03 | The system must provide a customizable dashboard where users can add, remove, and rearrange widgets.                             | All personas                        | H                |
| FR-04 | The system must allow users to create, edit, and delete tasks.                                                                   | Student, Professional, General User | H                |
| FR-05 | The system must allow users to create and manage sticky notes.                                                                   | Student, Professional               | M                |
| FR-06 | The system must include a timer feature (e.g., Pomodoro) for task management.                                                    | Student, Professional               | M                |
| FR-07 | The system must generate basic analytics (e.g., weekly gaming hours, anime episodes watched, music listening trends).            | Gamer, Anime Fan, Music Listener    | M                |
| FR-08 | The system must store user preferences (theme, layout, widget selection).                                                        | All personas                        | M                |
| FR-09 | The system must provide a responsive interface that works on desktop and mobile.                                                 | All personas                        | H                |
| FR-10 | The system must notify users of failed API connections or syncing issues.                                                        | All personas                        | M                |
| FR-11 | The system must allow users to manually add custom activities or notes not tied to external platforms.                           | General User                        | L                |
| FR-12 | The system must provide a unified view summarizing all linked activity and productivity tools.                                   | All personas                        | H                |

---

## **4. Non-Functional Requirements**

| Category        | Requirement Description                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Usability       | The system must provide an intuitive UI with clear navigation and minimal steps to access dashboards, tasks, and linked activity.          |
| Accessibility   | The system should follow WCAG-inspired accessibility practices (readable contrast, keyboard navigation, labels/alt text where applicable). |
| Performance     | The dashboard must load within 3 seconds under normal conditions (average network + typical user data).                                    |
| Reliability     | The system must handle API failures gracefully (fallback messages, retry options, and partial loading without crashing the app).           |
| Availability    | The web app should target 99% uptime during demo/testing windows, excluding scheduled maintenance.                                         |
| Security        | The system must use secure authentication practices (encrypted transport via HTTPS, secure token/session handling).                        |
| Privacy         | The system must clearly show what data is collected from third-party platforms and allow users to unlink accounts and delete stored data.  |
| Data Integrity  | User tasks, notes, and preferences must be stored consistently and not be overwritten by sync events from external APIs.                   |
| Maintainability | Code must follow a modular structure (separated API services, UI components, and business logic) to support future sprints and changes.    |
| Compatibility   | The system must support modern browsers (latest Chrome, Edge, Firefox) and responsive layouts for desktop and mobile.                      |
| Scalability     | The system should support increased users by caching API responses and limiting API calls (rate-limit safe sync strategy).                 |
| Compliance      | The system must follow third-party API Terms of Service and respect rate limits and required attribution (if needed).                      |

---

## **5. Assumptions**

| ID | Assumption                                                         | Impact if Incorrect                                |
| -- | ------------------------------------------------------------------ | -------------------------------------------------- |
| A1 | External APIs remain available and stable.                         | Core features may break or require redesign.       |
| A2 | Users are willing to link third-party accounts.                    | Reduced adoption or limited functionality.         |
| A3 | API rate limits are sufficient for expected user activity.         | Data may update slowly or inconsistently.          |
| A4 | Users value a unified dashboard over separate apps.                | App may not meet user expectations or usage goals. |
| A5 | Team members can learn and work with required APIs and frameworks. | Development delays and reduced feature scope.      |
| A6 | Users are comfortable storing personal activity data in one app.   | Privacy concerns could limit usage.                |

---

## **6. Constraints**

| ID | Constraint                                            | Reason                                        |
| -- | ----------------------------------------------------- | --------------------------------------------- |
| C1 | Must use publicly available APIs.                     | No access to private or paid enterprise APIs. |
| C2 | API rate limits and usage policies must be respected. | Compliance with third-party service terms.    |
| C3 | Web-based application only.                           | Time and scope limitations.                   |
| C4 | Limited hosting and infrastructure resources.         | Student project budget constraints.           |
| C5 | Team size limited to 3–4 members.                     | Course requirements.                          |

---

## **7. Sprint 1 Discovery Summary**

The primary users are individuals who frequently switch between multiple apps and websites to track their gaming, anime, and music activity. They also seek a simple way to stay organized, manage tasks, and maintain productivity.

This project aims to create a unified web application that consolidates entertainment tracking and personal productivity tools in one dashboard. The key challenge is maintaining performance and reliability while integrating multiple third-party APIs. Assumptions include user willingness to link external accounts and API stability. Constraints include limited time, small team size, and resource restrictions.

---
