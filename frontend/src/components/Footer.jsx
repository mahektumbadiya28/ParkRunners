import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Globe, Heart, Mail } from 'lucide-react';

const LINKS = {
  Product: ['Features', 'Marketplace', 'Valet Service', 'Pricing'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const SOCIAL_ICONS = [ExternalLink, Globe, Mail];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-card)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black gradient-text">VOLENPARK</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              The smart, peer-to-peer parking ecosystem connecting car owners, space hosts, and professional valet drivers.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_ICONS.map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border-color)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} VolenPark Platforms Inc. All rights reserved.
          </p>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by the VolenPark team
          </p>
        </div>
      </div>
    </footer>
  );
}
