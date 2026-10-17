import React from 'react';
import Link from 'next/link';
import ZeBarLogo from '@/components/ZeBarLogo';
import { ShieldAlert, ShieldCheck, ArrowLeft, ExternalLink, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to ZeBar Home</span>
          </Link>
          <ZeBarLogo size="sm" />
        </div>

        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Legal, Safety & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms & Conditions & Safety Policy
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            Last Updated: October 2026 • Official Legal Policy for ZeBar & ZENSTRO
          </p>
        </div>

        {/* PROMINENT SAFETY AUDIT HIGHLIGHT BOX (As requested) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest font-bold text-cyan-400">
                Mandatory Safety & Compliance Disclosure
              </span>
              <h2 className="text-lg font-bold text-white">
                Account History & Content Retention Policy
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Please be advised that <strong className="text-cyan-300 font-semibold">your QR generation history, target URLs, and uploaded media files (Text, MP3, Images) are permanently and securely recorded on our systems for safety and anti-abuse verification</strong>. In the event of any security issue, malicious link report, copyright infringement, or legal dispute, these records are audited by ZENSTRO management to ensure user safety and compliance with global digital laws.
              </p>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">01.</span> Company Ownership & Parent Organization
            </h2>
            <p>
              ZeBar (<a href="https://zebar.zenstro.space" className="text-cyan-400 underline font-mono">zebar.zenstro.space</a>) is an official software product operated and owned by <strong className="text-white">ZENSTRO</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Company Name: <strong className="text-slate-200">ZENSTRO</strong></li>
              <li>Official Company Website:{' '}
                <a
                  href="https://zenstro.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  zenstro.space <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Founder & CEO: <strong className="text-slate-200">Shubham Pathak</strong></li>
              <li>Official Executive Contact: <span className="font-mono text-cyan-300">ceo.shubhampathak@gmail.com</span></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">02.</span> User Accounts & Authentication
            </h2>
            <p>
              Public visitors may freely browse the ZeBar portal and explore demonstration previews. To generate, customize, download, or host QR codes, users are required to authenticate via Google OAuth. You agree that the Google profile details provided during authentication are accurate and belong to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">03.</span> Acceptable Use & Prohibited Activities
            </h2>
            <p>
              ZeBar provides a clean, 100% ad-free environment for legitimate creators, professionals, and businesses. You strictly agree NOT to generate QR codes containing or redirecting to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
              <li>Phishing, banking fraud, credential-harvesting schemes, or unauthorized malware downloads.</li>
              <li>Hate speech, harassment, illegal substances, or non-consensual content.</li>
              <li>Copyright-infringing audio files (MP3s) or images without ownership rights.</li>
              <li>Any content that violates the local laws of your jurisdiction or international cyber regulations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">04.</span> Cloud Storage & File Retention
            </h2>
            <p>
              Media files uploaded to ZeBar (including audio MP3 files, images, and custom brand logos) are stored on encrypted cloud object storage (Backblaze B2 / secure enterprise storage). While ZeBar implements industry-standard redundancy, users are advised to retain local copies of their original assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">05.</span> VIP Supervisory & Safety Inspection Rights
            </h2>
            <p>
              The executive leadership of ZENSTRO (directed by Shubham Pathak) reserves the right to review platform audit feeds and search user history in response to security incidents, law enforcement requests, or system integrity audits. Any account verified to engage in malicious distribution will be permanently terminated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">06.</span> Contact & Legal Escalations
            </h2>
            <p>
              For legal inquiries, abuse reports, or security disclosures, please reach out directly to the executive office:
            </p>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-xs text-slate-300">
              <p>Email: <a href="mailto:ceo.shubhampathak@gmail.com" className="text-cyan-400 underline">ceo.shubhampathak@gmail.com</a></p>
              <p>Organization: ZENSTRO (<a href="https://zenstro.space" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">zenstro.space</a>)</p>
              <p>Officer: Shubham Pathak</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>ZeBar by ZENSTRO • All Rights Reserved</span>
          <Link href="/dashboard" className="text-cyan-400 hover:underline">
            Go to QR Studio →
          </Link>
        </div>
      </div>
    </div>
  );
}
