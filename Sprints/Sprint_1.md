# Sprint 1 – Discovery Deliverables  
**Major Project – Planning and Design**  
**Course Code:** BTS530  
**Term:** 6  
**Team #:** 4  

---

## Team Members
| Student Name | Student ID |
|---------------|-------------|
| Nishnath Bandari | 105202220 |
| Mattrey Kumar Rana | 116092222 |
| Nisarg Jaswal | 116088220 |
| Ryan Tersigni | 106982259 |

---

## 0. Problem Statement and Solution

**Problem Statement:**  
Users today rely on multiple separate platforms such as Steam, MyAnimeList, Seneca Blackboard and other personal task apps to track their entertainment, hobbies, and productivity. Constantly switching between these tools causes disorganization, wasted time, and difficulty maintaining focus on daily goals.  

**Proposed Solution:**  
Our solution is a **unified web dashboard** that aggregates data from external APIs while allowing users to manage personal tasks, notes, and timers in one customizable interface. The goal is to create a seamless, privacy-conscious, and responsive platform that simplifies how users monitor progress and productivity across all their activities.  

---

## 1. Stakeholders
| Stakeholder | Type (Primary/Secondary) | Role / Relationship | Key Interests / Concerns | Influence (H/M/L) |
|--------------|--------------------------|----------------------|--------------------------|-------------------|
| Users | Primary | People interested in tracking their usage | Easy-to-use interface, privacy and data sync | High |
| API Providers | Secondary | Provide external data through public APIs | Proper API usage and compliance with ToA | Medium |
| Dev Team | Primary | Designers, developers, and testers for building and maintaining app | Clear sprint planning, stable API | High |
| Hosting Provider | Secondary | Hosts the web app and manages uptime | Reliable infrastructure, cost efficiency, resource limits | High |
| Potential Partners and Competitors | Secondary | Future collaborations | Exposure and increase in traffic for app usage | Low |

---

## 2. Personas
| Name | Persona Type | Role | Goals | Pain Points | Technical Comfort | Key Scenarios |
|-------|---------------|------|--------|-------------|------------------|---------------|
| **John Doe (Age 20)** | Primary | College student and gamer | Wants one place to see game progress, anime watchlists and personal tasks | Constantly switching between multiple apps | High | Links Steam and MAL to track activity; adds study reminders and tasks |
| **Jane Dowe (Age 28)** | Primary | Working professional who enjoys anime and music | Wants a dashboard that helps her unwind and organize her hobbies | Finds it hard to remember where she left off on different platforms | Medium | Connects Spotify for music while tracking tasks and shows on MAL |
| **Robert Robertson (Age 16)** | Primary | High school student managing schoolwork and projects | Wants to organize assignments, study sessions, and daily tasks in one place | Juggling multiple apps for to-do lists, notes, and timers | High | Uses dashboard to plan tasks, track study sessions with timer, and set reminders |

---

## 3. Functional Requirements
| ID | Requirement Description | Related Persona(s) | Priority (H/M/L) |
|----|--------------------------|-------------------|-----------------|
| FR-01 | Users should be able to sign in and connect external accounts like Steam, MAL, or Spotify. | John, Jane | H |
| FR-02 | The system should pull basic activity data (games played, anime progress, music stats) from connected services. | John, Jane | H |
| FR-03 | Users should have a dashboard where they can arrange widgets based on what they use the most. | All personas | H |
| FR-04 | The system should let users create and update tasks for school, work, or personal use. | John, Jane, Robert | H |
| FR-05 | A simple notes or sticky-note feature should be available for quick reminders. | Jane, Robert | M |
| FR-06 | A built-in study/work timer (e.g., Pomodoro) should help users manage focus sessions. | John, Robert | M |
| FR-07 | The system should show a summary of the user’s overall activity (e.g., weekly trends). | John, Jane | M |
| FR-08 | The interface should work smoothly on both desktop and mobile devices. | All personas | H |
| FR-09 | The system should alert users if syncing with an external service fails. | All personas | M |

---

## 4. Non-Functional Requirements
| Category | Requirement Description |
|-----------|-------------------------|
| Usability | The system must provide an intuitive UI with clear navigation and minimal steps to access dashboards, tasks, and linked activity. |
| Accessibility | Follow WCAG-inspired practices (readable contrast, keyboard navigation, labels/alt text). |
| Performance | Dashboard must load within 3 seconds under normal conditions. |
| Reliability | Handle API failures gracefully with fallback messages and retry options. |
| Availability | Target 99% uptime during demo/testing windows (excluding maintenance). |
| Security | Use secure authentication (HTTPS, token/session handling). |
| Privacy | Clearly show data collected from third-party platforms and allow unlink/delete options. |
| Data Integrity | Ensure user tasks/notes/preferences aren’t overwritten by API sync events. |
| Maintainability | Use modular code structure (API services, UI components, business logic). |
| Compatibility | Support modern browsers and responsive layouts. |
| Scalability | Cache API responses and use rate-limit-safe sync strategies. |
| Compliance | Follow third-party API Terms of Service and required attribution. |

---

## 5. Assumptions
| ID | Assumption | Impact if Incorrect |
|----|-------------|--------------------|
| A1 | External APIs remain available and stable. | Core features may break or require redesign. |
| A2 | Users are willing to link third-party accounts. | Reduced adoption or limited functionality. |
| A3 | API rate limits are sufficient for expected user activity. | Data may update slowly or inconsistently. |
| A4 | Users value a unified dashboard over separate apps. | App may not meet user expectations. |
| A5 | Team members can learn and work with required APIs and frameworks. | Development delays and reduced feature scope. |
| A6 | Users are comfortable storing personal activity data in one app. | Privacy concerns could limit usage. |

---

## 6. Constraints
| ID | Constraint | Reason |
|----|-------------|--------|
| C1 | Must use publicly available APIs. | No access to private or paid enterprise APIs. |
| C2 | API rate limits and usage policies must be respected. | Compliance with third-party terms. |
| C3 | Web-based application only. | Time and scope limitations. |
| C4 | Limited hosting and infrastructure resources. | Student project budget constraints. |
| C5 | Team size limited to 3–4 members. | Course requirements. |

---

## 7. Sprint 1 Discovery Summary
The primary users are people who have problems having to use different apps and websites to keep track of what they’re watching or playing, and also for general use to help organize themselves so they meet deadlines or complete tasks effectively.
