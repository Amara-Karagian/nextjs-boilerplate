'use client';

import { useState } from 'react';
import { hotlines, CountryHotlines } from '../lib/hotlines';

function PhoneLink({ number }: { number: string }) {
  const clean = number.replace(/[^+\d]/g, '');
  return (
    <a
      href={`tel:${clean}`}
      className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-sm transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      {number}
    </a>
  );
}

function HotlineSection({ title, icon, items }: {
  title: string;
  icon: string;
  items: { name: string; number: string; description?: string; available?: string; sms?: string; chat?: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.number} className="bg-gray-50 rounded-xl p-3">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <span className="font-medium text-gray-900 text-sm">{item.name}</span>
              {item.available && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {item.available}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <PhoneLink number={item.number} />
              {item.sms && (
                <span className="text-xs text-gray-500 self-center">📱 SMS: {item.sms}</span>
              )}
              {item.chat && (
                <span className="text-xs text-gray-500 self-center">💬 {item.chat}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountryCard({ country }: { country: CountryHotlines }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">{country.country}</h3>
          <a
            href={`tel:${country.emergency}`}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors"
          >
            🆘 {country.emergency}
          </a>
        </div>

        <div className="flex gap-2 text-xs text-gray-500">
          <span>Emergency: <strong className="text-red-600">{country.emergency}</strong></span>
          {country.police && country.police !== country.emergency && (
            <span>• Police: <strong>{country.police}</strong></span>
          )}
        </div>
      </div>

      {(country.domestic_violence || country.sexual_assault || country.crisis) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-purple-700 font-medium flex items-center justify-between transition-colors border-t border-gray-100"
          >
            <span>View all helplines</span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="p-4 border-t border-gray-100 space-y-4">
              {country.domestic_violence && (
                <HotlineSection
                  title="Domestic Violence"
                  icon="🏠"
                  items={country.domestic_violence}
                />
              )}
              {country.sexual_assault && (
                <HotlineSection
                  title="Sexual Assault"
                  icon="💜"
                  items={country.sexual_assault}
                />
              )}
              {country.crisis && (
                <HotlineSection
                  title="Mental Health & Crisis"
                  icon="🧠"
                  items={country.crisis}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HotlineFinder() {
  const [search, setSearch] = useState('');

  const filtered = search.trim().length === 0
    ? hotlines
    : hotlines.filter((h) =>
        h.country.toLowerCase().includes(search.toLowerCase()) ||
        h.code.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div>
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search your country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 focus:border-purple-500 rounded-2xl focus:outline-none text-gray-900 text-base transition-colors"
          aria-label="Search for your country"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>No results for &quot;{search}&quot;</p>
          <p className="text-sm mt-1">Try a different country name</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} {filtered.length === 1 ? 'country' : 'countries'} found
            {search && ` for "${search}"`}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((country) => (
              <CountryCard key={country.code} country={country} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
