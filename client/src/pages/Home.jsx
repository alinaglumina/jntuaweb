import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlides, useNotifications } from '../api/public.js';
import { HeroSlider, NoticeCard } from '../components/index.js';

const UNITS = [
  ['JNTUACEA Ananthapuramu', 'https://www.jntuacea.ac.in/'],
  ['JNTUACEA Pulivendula', 'https://www.jntuacep.ac.in/'],
  ['JNTUACEA Kalikiri', 'https://www.jntuacea.ac.in/'],
  ['JNTUA OTPRI', 'https://www.jntua.ac.in/otpri'],
  ['JNTUA SMS', 'https://www.jntua.ac.in/profile/school-of-management-studies'],
];
const RECOGNITIONS = [
  ['UGC', 'https://www.ugc.gov.in/'], ['AICTE', 'https://www.aicte-india.org/'],
  ['APSCHE', 'https://cets.apsche.ap.gov.in/'], ['NAAC', 'https://www.naac.gov.in/'],
  ['NIRF', 'https://www.nirfindia.org/'], ['MoE', 'https://www.education.gov.in/'],
  ['Govt. of AP', 'https://www.ap.gov.in/'],
];
const NOTIF_TABS = [['news', 'Latest News'], ['exam', 'Examinations'], ['admission', 'Admissions'], ['research', 'R&D'], ['placement', 'Placements'], ['sports', 'Sports'], ['tenders', 'Tenders']];

function Notifications() {
  const [cat, setCat] = useState('news');
  const { data = [] } = useNotifications(cat);
  return (
    <section className="container py-14">
      <div className="text-center"><h2 className="text-2xl">University Notifications</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {NOTIF_TABS.map(([k, l]) => (
          <button key={k} onClick={() => setCat(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cat === k ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}>{l}</button>
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-3xl">
        {data.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No notifications in this category yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg bg-white shadow-card">
            {data.slice(0, 8).map((n) => <NoticeCard key={n._id} title={n.title} category={n.category} date={n.createdAt} href={n.attachment} />)}
          </div>
        )}
        <div className="mt-4 text-center"><Link to="/notifications" className="btn-ghost text-sm">View all notifications</Link></div>
      </div>
    </section>
  );
}

function Hero() { const { data: slides = [] } = useSlides(); return <HeroSlider slides={slides} />; }

export default function Home() {
  return (
    <>
      <Helmet><title>JNTUA — Jawaharlal Nehru Technological University Anantapur</title></Helmet>
      <Hero />

      {/* VC message */}
      <section className="container grid gap-8 py-14 md:grid-cols-[240px_1fr] md:items-start">
        <div className="text-center">
          <div className="mx-auto grid h-64 w-56 place-items-center rounded-lg border-4 border-white bg-navy/5 font-display text-lg text-navy shadow-card">Photo</div>
          <p className="mt-3 font-display text-lg font-bold text-navy">Prof. H. Sudarsana Rao</p>
          <p className="text-sm text-slate-500">Vice Chancellor, JNTUA</p>
          <Link to="/administration/vice-chancellor" className="btn-ghost mt-3 text-sm">View Profile</Link>
        </div>
        <div>
          <h3 className="text-2xl">Vice-Chancellor’s Message</h3>
          <div className="mt-3 space-y-3 text-slate-700">
            <p>It is a matter of honor and immense pleasure that destiny has given me an opportunity to lead JNT University Anantapur.</p>
            <p>Higher education globally has witnessed significant change and remarkable growth. Every institution has geared up to meet global challenges by harnessing the latest technologies. The move towards inter-disciplinary studies, research-based and interactive learning with technology integration has opened up several options as well as multiple challenges.</p>
            <Link to="/administration/vice-chancellor" className="inline-flex items-center gap-1 font-semibold text-crimson">Read more <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section className="bg-paper">
        <div className="container py-14">
          <div className="text-center"><h2 className="text-2xl">Welcome to JNTUA</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
          <div className="mx-auto mt-6 max-w-4xl space-y-4 text-slate-700">
            <p>The College of Engineering, Anantapur was started at Guindy, Madras in 1946 and shifted to Anantapur in 1948. Initially affiliated to Madras University (1946–1955) and Sri Venkateswara University, Tirupathi (1955–1972). In 1972, by an Act of State Legislature, JNT University was established at Hyderabad and the College of Engineering, Anantapur went into the fold of JNTU. In 2008, JNTU was trifurcated into three independent universities — JNTU Hyderabad, JNTU Kakinada and JNTU Anantapur.</p>
            <p>In addition to its four constituent colleges, JNTUA has 98 Engineering Colleges, 33 Pharmacy Colleges and 29 stand-alone MBA/MCA colleges affiliated to it. Since its inception, JNTUA is committed to nurturing technological education and producing technical manpower comparable to the best in the world.</p>
          </div>
        </div>
      </section>

      {/* Constituent units */}
      <section className="container py-14">
        <div className="text-center"><h2 className="text-2xl">Constituent Units</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {UNITS.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="card p-4 text-center hover:shadow-lift">
              <div className="mb-3 grid h-24 place-items-center rounded bg-navy/5 text-navy"><i className="fa-solid fa-building-columns text-2xl" aria-hidden="true" /></div>
              <span className="text-sm font-semibold text-navy">{name}</span>
            </a>
          ))}
        </div>
      </section>

      <Notifications />

      {/* Recognitions */}
      <section className="bg-paper">
        <div className="container py-14">
          <div className="text-center"><h2 className="text-2xl">Our Recognitions & Approvals</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {RECOGNITIONS.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="card grid h-24 w-32 place-items-center gap-1 p-3 text-center hover:shadow-lift">
                <i className="fa-solid fa-award text-xl text-crimson" aria-hidden="true" />
                <span className="text-xs font-semibold text-navy">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container grid gap-8 py-14 md:grid-cols-2">
        <div>
          <h3 className="text-2xl"><i className="fa-solid fa-address-card text-crimson" aria-hidden="true" /> Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li><i className="fa-solid fa-location-dot mr-2 text-navy" aria-hidden="true" /><strong>JNTU Anantapur</strong>, Ananthapuramu – 515002, Andhra Pradesh, India</li>
            <li><i className="fa-solid fa-phone mr-2 text-navy" aria-hidden="true" />+91-8554-272475 (Main) · +91-8554-272476 (Exam Branch)</li>
            <li><i className="fa-solid fa-envelope mr-2 text-navy" aria-hidden="true" />registrar@jntua.ac.in · vc@jntua.ac.in</li>
            <li><i className="fa-solid fa-globe mr-2 text-navy" aria-hidden="true" /><a href="https://www.jntua.ac.in" target="_blank" rel="noopener noreferrer">www.jntua.ac.in</a></li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-lg shadow-card">
          <iframe title="JNTUA location" className="h-64 w-full border-0" loading="lazy"
            src="https://www.google.com/maps?q=Jawaharlal+Nehru+Technological+University+Anantapur&output=embed" />
        </div>
      </section>
    </>
  );
}
