"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  BarChart3,
  Code2,
  Sparkles,
  Trophy,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: BookOpen,
    title: "Classroom Hub",
    description:
      "Join classes, submit assignments, track grades, and access resources — all in one place.",
    color: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description:
      "Reddit-style discussions scoped by university, class, or public. Ask questions, share notes, and collaborate.",
    color: "from-violet-500 to-purple-500",
    shadowColor: "shadow-violet-500/20",
  },
  {
    icon: Code2,
    title: "Project Portfolio",
    description:
      "Showcase your projects with GitHub integration, tech tags, and collaboration tools.",
    color: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "Clubs & Events",
    description:
      "Create or join student clubs, organize events, workshops, and competitions with QR check-in.",
    color: "from-orange-500 to-amber-500",
    shadowColor: "shadow-orange-500/20",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn XP for participation, climb rank tiers from Lurker to Legend, unlock badges, and compete on leaderboards.",
    color: "from-yellow-500 to-orange-500",
    shadowColor: "shadow-yellow-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "AI-powered assignment explanations, forum post summarization, and code reviews using Claude.",
    color: "from-pink-500 to-rose-500",
    shadowColor: "shadow-pink-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Educators get real-time insights into class performance, engagement metrics, and student progress.",
    color: "from-indigo-500 to-blue-500",
    shadowColor: "shadow-indigo-500/20",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description:
      "Full support for English, French, and Arabic with RTL layout — accessible to every student.",
    color: "from-cyan-500 to-teal-500",
    shadowColor: "shadow-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Block, mute, report, and content moderation with strike system to keep the community safe.",
    color: "from-red-500 to-pink-500",
    shadowColor: "shadow-red-500/20",
  },
];

const stats = [
  { value: "8+", label: "Role Types", icon: Users },
  { value: "50+", label: "Features", icon: Zap },
  { value: "3", label: "Languages", icon: Globe },
  { value: "∞", label: "Possibilities", icon: Sparkles },
];

const roles = [
  { name: "Student", description: "Access classes, earn XP, collaborate", icon: GraduationCap },
  { name: "Educator", description: "Manage classes, grade assignments", icon: BookOpen },
  { name: "Club Manager", description: "Create clubs, organize events", icon: Users },
  { name: "Admin", description: "Platform-wide moderation & analytics", icon: Shield },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 border-b border-white/5">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shadow-xl shadow-blue-500/10 overflow-hidden border border-white/10">
              <Image src="/campus-mark-only.png" alt="Campus Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">Campus</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 rounded-xl h-10 px-6 font-bold text-sm">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
          >
            <Flame className="w-4 h-4" />
            <span>The all-in-one student platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight"
          >
            Your Academic Life,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Unified
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Campus brings together classrooms, forums, projects, clubs, and gamification into one
            beautiful platform. Built for students, educators, and university communities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 rounded-xl h-13 px-8 font-bold text-base gap-2">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-13 px-8 font-bold text-base backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-3xl font-display font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/40 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
            Everything You Need
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            A comprehensive suite of tools designed for modern academic communities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Card className="group border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500 rounded-2xl h-full overflow-hidden hover:border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
            Built for Everyone
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Role-based experiences tailored to each member of the academic community
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role, i) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 rounded-2xl text-center group hover:border-white/10">
                <CardContent className="p-8 space-y-4">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <role.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{role.name}</h3>
                  <p className="text-sm text-white/40">{role.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Highlight */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <h2 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
                Modern Tech Stack
              </h2>
              <p className="text-lg text-white/40 leading-relaxed">
                Built with the latest technologies for performance, scalability, and developer experience.
              </p>
              <div className="space-y-3">
                {[
                  "Next.js 16 App Router with Turbopack",
                  "Prisma ORM with Neon PostgreSQL",
                  "NextAuth v5 with JWT strategy",
                  "Tailwind CSS v4 + shadcn/ui",
                  "Claude AI for intelligent features",
                  "PWA with push notifications",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-white/60">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { name: "Next.js 16", desc: "React Framework", icon: Zap },
                { name: "Prisma", desc: "Type-safe ORM", icon: Shield },
                { name: "Neon", desc: "Serverless PostgreSQL", icon: Globe },
                { name: "Claude AI", desc: "Intelligent Features", icon: Sparkles },
                { name: "Tailwind v4", desc: "Utility CSS", icon: Star },
                { name: "PWA Ready", desc: "Install & Offline", icon: Flame },
              ].map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                >
                  <Card className="border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all rounded-xl group hover:border-white/10">
                    <CardContent className="p-5 space-y-2">
                      <tech.icon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                      <p className="text-xs text-white/30">{tech.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-8"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold tracking-tight">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Campus Experience
            </span>
            ?
          </h2>
          <p className="text-lg text-white/40 max-w-lg mx-auto">
            Join the community and start collaborating, learning, and growing together.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 rounded-xl h-13 px-8 font-bold text-base gap-2">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-13 px-8 font-bold text-base backdrop-blur-sm"
              >
                Try Demo Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                <Image src="/campus-mark-only.png" alt="Campus Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-sm font-display font-bold text-white/60">Campus Platform</span>
            </div>
            <p className="text-xs text-white/30">
              Built with Next.js, Prisma, Neon PostgreSQL & Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}