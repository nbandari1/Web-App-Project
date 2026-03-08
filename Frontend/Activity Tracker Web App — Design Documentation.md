# Activity Tracker Web App — Design Documentation

## Figma Link: https://www.figma.com/proto/s3iaE7mzVpVQQmRkf6vsya/Activity-Tracker-App?node-id=0-1&t=Sse7l2DK3BkXRrcJ-1

## Introduction

This document outlines the design system used in the Figma prototype and explains the user flow across the four primary frames:
 

- Login Page  
- Core Dashboard  
- Connected Accounts  
- Quick Task & Notes  



---

## Purpose of the Design

The design focuses on:

- A clean, modern dashboard layout  
- Clear visual hierarchy  
- Consistent widget structure  
- Easy scanning of information  
- Smooth integration of external activity data  
- A unified design system across all frames  

---

# Design System

## Typography

| Usage | Font | Weight | Size |
|-------|------|--------|------|
| App Title | Inter | 700 | 28–32px |
| Section Titles | Inter | 600 | 20–24px |
| Widget Titles | Inter | 600 | 16–18px |
| Body Text | Inter | 400 | 14–16px |
| Metadata | Inter | 400 | 12–13px |

Inter was selected for its readability, clean geometry, and suitability for dashboard-based interfaces.

---

## Color Palette

### Primary Colors

| Purpose | Hex |
|----------|------|
| Primary Blue | `#3B82F6` |
| Primary Dark | `#1E293B` |

### Neutral Colors

| Purpose | Hex |
|----------|------|
| Background | `#F8FAFC` |
| Card Background | `#FFFFFF` |
| Border | `#E2E8F0` |
| Text Primary | `#0F172A` |
| Text Secondary | `#475569` |

### Status Colors

| Status | Hex |
|--------|------|
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |

---

# Screen Dimensions

All frames in the prototype follow a consistent screen size to maintain layout stability and design consistency.

## Primary Screen Size

- 1440 × 1024 px  
- Desktop-first layout  
- Optimized for dashboard-style applications  

### Why 1440 × 1024?

- Common desktop viewport size  
- Provides sufficient horizontal space for sidebar and multi-column widgets  
- Aligns with standard Figma desktop frame presets  

---

## Frames Using This Dimension

- Login Page  
- Core Dashboard  
- Connected Accounts  
- Quick Task & Notes  

Each frame is designed within the same 1440 × 1024 px canvas to ensure consistency across the user experience.

---

# Frame Descriptions

## Frame 1 — Login Page

- Clean login form  
- Email and password fields  
- “Continue with Steam / Spotify / MyAnimeList” buttons  
- Dark theme with centered layout  
- Redirects to Core Dashboard upon successful login  

---

## Frame 2 — Core Dashboard

- Greeting and current date  
- Activity statistics:
  - Steam hours played  
  - Spotify listening minutes  
  - MyAnimeList episodes watched  
- Tasks widget  
- Notes widget  
- Focus timer  
- Recently played (Steam)  
- Currently watching (MyAnimeList)  
- Sidebar navigation  

---

## Frame 3 — Connected Accounts

- Displays connection status for external platforms  
- Connect / Disconnect buttons  
- Synced statistics (e.g., followers, listening time)  
- Layout consistency with dashboard structure  

---

## Frame 4 — Quick Task & Notes

- Task list with priority tags  
- Checkboxes for completion  
- Edit and delete controls  
- Notes section with timestamps  
- Minimal layout optimized for quick interaction  

---

# User Flow

<img width="1024" height="687" alt="image" src="https://github.com/user-attachments/assets/2c8330a6-63ce-4808-b2bd-6730836d73b4" />

---



# Summary

The Activity Tracker Web App design emphasizes:

- Clear hierarchy  
- Modular widget structure  
- Visual consistency  
- Dashboard scalability  
