# 🍲 CommunityKitchen

**CommunityKitchen** is a community-driven platform for organizing, sharing, and managing local meals, food donations, and cooking events.  
It connects neighbors, volunteers, and organizations to reduce food waste, support those in need, and strengthen community bonds.

---

## ✨ Features

- **📅 Event Scheduling** – Create and join cooking events, potlucks, and donation drives.
- **📍 Location-Based Discovery** – See nearby kitchens, events, and drop-off points.
- **🤝 Volunteer Coordination** – Sign up to help with cooking, delivery, or setup.
- **🍱 Meal Sharing** – Post available meals and request portions.
- **📊 Impact Tracking** – Track meals shared, waste reduced, and community engagement.

---

## 🛠 Tech Stack

- **Frontend:** React (Next.js) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** OAuth 2.0 / JWT
- **Hosting:** Vercel (frontend) + Render/Heroku (backend)
- **APIs:** Google Maps API for location services

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/communitykitchen.git

cd communitykitchen

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Fill in your MongoDB URI, API keys, etc.

# Run development server
npm run dev
