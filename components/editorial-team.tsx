import React from "react";
import { ShieldCheck, UserCheck, Award, CheckCircle2, Info } from "lucide-react";
import { ReviewerMascot } from "@/components/mascot";

export function EditorialTeamSection() {
  const reviewers = [
    {
      name: "Alex Rivera",
      role: "Lead Hardware Editor",
      bio: "8+ years evaluating mechanical keyboards, high-refresh panels, and workstation ergonomics for software engineers.",
      credentials: "Vim & QMK Specialist",
      initials: "AR",
    },
    {
      name: "Dr. Marcus Vance",
      role: "Ergonomics Consultant",
      bio: "Physical therapist focusing on repetitive strain injury (RSI) prevention and lumbar spine support in sedentary desk setups.",
      credentials: "Ergonomic Certified",
      initials: "MV",
    },
    {
      name: "Elena Rostova",
      role: "Peripherals & Connectivity Analyst",
      bio: "Hardware tester specializing in Thunderbolt 4 docks, DisplayPort MST protocols, and multi-device Bluetooth latency benchmarks.",
      credentials: "Protocol Tester",
      initials: "ER",
    },
  ];

  return (
    <section id="editorial-team" className="py-16 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Human Editorial Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Meet the Reviewers & How We Evaluate Gear
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Affiliate review sites are frequently clogged with automated rehashes. At SmartPick, every review and buying guide is researched by real hardware practitioners who evaluate verified schematics and ergonomics.
          </p>
        </div>

        {/* Reviewer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewers.map((rev) => (
            <div
              key={rev.name}
              className="editorial-card p-6 flex flex-col justify-between space-y-4 shadow-tinted"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-950 text-white flex items-center justify-center font-black text-sm shadow-sm border border-indigo-800">
                    {rev.initials}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                    {rev.credentials}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    {rev.name}
                  </h3>
                  <span className="text-xs text-indigo-700 font-semibold block">
                    {rev.role}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rev.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <UserCheck className="h-3 w-3 text-emerald-600" />
                <span>Verified Independent Contributor</span>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Methodology Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Award className="h-4 w-4 text-amber-600" />
            <span>Our 3-Pillar Evaluation Methodology</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <strong className="text-slate-900 block font-bold">1. Verified Schematics</strong>
              <p className="text-slate-600 leading-relaxed text-xs">
                We inspect manufacturer specs, teardowns, switch actuation forces, and display contrast ratios rather than marketing slogans.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <strong className="text-slate-900 block font-bold">2. Long-Term Durability</strong>
              <p className="text-slate-600 leading-relaxed text-xs">
                We analyze warranty track records, cross-platform firmware reliability, and verified customer sentiment over 12–24 month periods.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <strong className="text-slate-900 block font-bold">3. Zero Sponsored Bias</strong>
              <p className="text-slate-600 leading-relaxed text-xs">
                Brands cannot buy editorial placement or higher ratings. Our revenue comes solely from standard merchant affiliate links when readers purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
