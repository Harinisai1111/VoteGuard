<div align="center">
<img width="1200" height="475" alt="VoteGuard Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# VoteGuard: AI-Powered Electoral Integrity System
</div>

**VoteGuard** is a next-generation electoral roll management system designed to detect, analyze, and resolve identity inconsistencies in voter databases. Leveraging Google's Gemini AI, it provides Election Officers with actionable intelligence to maintain a clean and duplicate-free registry.

## 🚀 Key Features

### 🛡️ Integrity Management
- **Automated Anomaly Detection**: identifies potential duplicates, deceased voters, and metadata inconsistencies.
- **Identity Clash Center**: Visualizes cross-node conflicts where multiple EPICs share the same Aadhaar hash.
- **Cleared Logs History**: Tracks the resolution history of every flag, including officer remarks and timestamps.

### 📋 Field Operations
- **SIR Task Queue**: Assigns verification tasks to field officers for ground-level validation.
- **Digital Protocols**: Standardized workflows for marking voters as Verified, Shifted, Deceased, or Duplicate.

### 🏛️ Municipal Integration
- **Death Certificate Analysis**: Upload death certificates for AI-powered extraction and automatic matching against the electoral roll.
- **Decommissioning Terminal**: Streamlined process to remove deceased voters with audit trails.

### 📊 National Dashboard
- **Real-time Metrics**: Live tracking of identity clashes, risk profiles, and registry health.
- **Jurisdiction Filters**: Filter data by State, District, or specific Polling Station.

---

## 🛠️ Setup & Installation

**Prerequisites:** Node.js (v18+)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Harinisai1111/VoteGuard.git
   cd voteguard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env.local` file in the root directory.
   - Add your Gemini API Key (Required for AI features):
     ```env
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Initialize Database**
   - Generate the mock original dataset from the configuration:
     ```bash
     npx tsx scripts/generate_dataset.ts
     ```
   - This creates `src/data/original_dataset.json` which acts as the local database.

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000` (or the port shown in terminal).

---

## 🤖 Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini 1.5 Pro & Flash (via `@google/genai` SDK)
- **Visualization**: Recharts
- **Icons**: Lucide React

## 📄 License
This project is for educational and hackathon purposes.
