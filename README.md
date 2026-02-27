# MoneyMind AI

A high-end, production-quality AI-powered Personal Finance Manager web application built with Next.js, TypeScript, and Tailwind CSS. Features a premium fintech UI with glassmorphism design, AI-driven insights, interactive charts, and comprehensive financial tracking. Built for Indian users with INR currency, Indian banks, and local context.

![MoneyMind AI Dashboard](https://via.placeholder.com/800x400/6366f1/ffffff?text=MoneyMind+AI)

## Features

### Core Features
- **AI-Powered Insights** - Smart recommendations for savings, spending alerts, anomaly detection, and financial forecasts
- **Interactive Dashboard** - Real-time overview of total balance, monthly spending, predicted spending, and anomaly alerts
- **Transaction Management** - Searchable, filterable transaction table with pagination and detailed records
- **Financial Goals** - Track progress toward savings goals with visual progress indicators
- **Account Linking** - Connect Indian bank accounts (SBI, HDFC, ICICI, Axis, Kotak, Paytm)
- **Financial Analytics** - Deep insights with spending trends, category breakdown, and monthly summaries

### Indian Localization
- **Currency** - Indian Rupee (₹) formatting throughout
- **Banks** - Popular Indian banks for account linking
- **Terminology** - Indian financial context (Fixed Deposits, etc.)
- **Timezone** - India Standard Time (IST) default

### Design Features
- **Premium Fintech UI** - Glassmorphism cards, soft gradients, subtle glow effects
- **Dark/Light Theme** - Full theme support with system preference detection
- **Smooth Animations** - Framer Motion powered micro-interactions and transitions
- **Responsive Design** - Collapsible sidebar, mobile-optimized experience
- **Interactive Charts** - Recharts powered spending trends, category distribution, weekly breakdown, and forecasts

### Authentication & Security
- **Full Auth Flow** - Login, register, forgot password with form validation (Zod + React Hook Form)
- **Protected Routes** - Dashboard accessible only to authenticated users
- **Bank-Level Security UI** - Security indicators and encryption messaging

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **State**: React Context (Auth, Theme)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Auth**: Supabase Auth with Row Level Security (RLS)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier works fine)

### Supabase Setup

1. Create a new project at [supabase.io](https://supabase.io)
2. Go to Project Settings > API and copy your `Project URL` and `anon public` key
3. Run the SQL setup script in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  is_anomaly BOOLEAN DEFAULT FALSE,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/moneymind-ai.git
cd moneymind-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## Project Structure

```
moneymind-ai/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Protected dashboard routes
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── transactions/   # Transaction management
│   │   │   ├── insights/       # AI insights page
│   │   │   ├── goals/          # Financial goals
│   │   │   ├── accounts/       # Account linking
│   │   │   ├── analytics/      # Analytics & reports
│   │   │   ├── settings/       # Profile settings
│   │   │   └── layout.tsx      # Dashboard layout
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── forgot-password/    # Forgot password
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles & design system
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── charts/             # Chart components
│   │   └── onboarding/         # Onboarding components
│   ├── context/                # React Context providers
│   ├── types/                  # TypeScript types
│   └── lib/                    # Utility functions
├── public/                     # Static assets
└── package.json               # Dependencies
```

## Design System

### Colors
- Primary: `#6366f1` (Indigo)
- Secondary: `#06b6d4` (Cyan)
- Accent: `#8b5cf6` (Purple)
- Success: `#10b981` (Emerald)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Rose)

### Glassmorphism
```css
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}
```

## API Integration (Future)

The application is architected to easily integrate with external APIs:

- **Plaid/Yodlee** - For real bank account linking
- **OpenAI/Anthropic** - For advanced AI expense classification
- **Custom ML API** - For spending forecasting models

## License

MIT License - feel free to use this project for personal or commercial purposes.

Built with ❤️ for the future of personal finance in India.
