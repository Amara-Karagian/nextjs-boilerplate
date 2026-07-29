'use client';

import { useState } from 'react';

interface Plan {
  safePlace: string;
  trustedPeople: string;
  emergencyBag: string[];
  safeWord: string;
  exitRoute: string;
  localHotline: string;
  bankAccount: string;
  importantDocs: string[];
  onlineAccounts: string;
  children: string;
}

const bagItems = [
  'ID / Passport',
  'Emergency cash',
  'Phone charger',
  'Medication',
  'Children\'s documents',
  'Change of clothes',
  'Important documents (copies)',
  'House / car keys',
  'Bank cards',
  'Photos / sentimental items',
];

const docItems = [
  'Birth certificate',
  'Passport / ID',
  'Marriage certificate',
  'Children\'s documents',
  'Medical records',
  'Bank account details',
  'Insurance documents',
  'Lease / mortgage documents',
  'Work/immigration papers',
];

const steps = [
  { id: 'safe-place', title: 'Safe Place', icon: '🏠' },
  { id: 'trusted-people', title: 'Trusted People', icon: '👥' },
  { id: 'emergency-bag', title: 'Emergency Bag', icon: '🎒' },
  { id: 'safe-word', title: 'Safe Word', icon: '🔒' },
  { id: 'exit-route', title: 'Exit Route', icon: '🚪' },
  { id: 'hotline', title: 'Local Hotline', icon: '📞' },
  { id: 'finances', title: 'Finances', icon: '💳' },
  { id: 'documents', title: 'Documents', icon: '📄' },
  { id: 'online', title: 'Online Safety', icon: '💻' },
  { id: 'children', title: 'Children', icon: '👧' },
];

export default function SafetyPlanBuilder() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>({
    safePlace: '',
    trustedPeople: '',
    emergencyBag: [],
    safeWord: '',
    exitRoute: '',
    localHotline: '',
    bankAccount: '',
    importantDocs: [],
    onlineAccounts: '',
    children: '',
  });
  const [completed, setCompleted] = useState(false);

  const toggleBagItem = (item: string) => {
    setPlan((p) => ({
      ...p,
      emergencyBag: p.emergencyBag.includes(item)
        ? p.emergencyBag.filter((i) => i !== item)
        : [...p.emergencyBag, item],
    }));
  };

  const toggleDocItem = (item: string) => {
    setPlan((p) => ({
      ...p,
      importantDocs: p.importantDocs.includes(item)
        ? p.importantDocs.filter((i) => i !== item)
        : [...p.importantDocs, item],
    }));
  };

  const downloadPlan = () => {
    const lines = [
      '=== MY PERSONAL SAFETY PLAN ===',
      'Created with SafeHer',
      '',
      '🏠 SAFE PLACE TO GO:',
      plan.safePlace || '(not filled in)',
      '',
      '👥 TRUSTED PEOPLE TO CONTACT:',
      plan.trustedPeople || '(not filled in)',
      '',
      '🔒 MY SAFE WORD:',
      plan.safeWord || '(not filled in)',
      '',
      '🚪 EXIT ROUTE FROM HOME:',
      plan.exitRoute || '(not filled in)',
      '',
      '📞 LOCAL HELPLINE:',
      plan.localHotline || '(not filled in)',
      '',
      '💳 FINANCIAL SAFETY:',
      plan.bankAccount || '(not filled in)',
      '',
      '💻 ONLINE ACCOUNT SAFETY:',
      plan.onlineAccounts || '(not filled in)',
      '',
      '👧 PLAN FOR CHILDREN:',
      plan.children || '(not applicable)',
      '',
      '🎒 EMERGENCY BAG CHECKLIST:',
      ...bagItems.map((i) => `${plan.emergencyBag.includes(i) ? '[x]' : '[ ]'} ${i}`),
      '',
      '📄 DOCUMENTS TO SECURE:',
      ...docItems.map((i) => `${plan.importantDocs.includes(i) ? '[x]' : '[ ]'} ${i}`),
      '',
      'REMEMBER: You are not alone. Call 112 (international) in an emergency.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-safety-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (completed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Your Safety Plan is Ready</h3>
        <p className="text-green-700 mb-6">
          Keep this plan somewhere safe — memorize key parts if needed, and share it with one trusted person.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={downloadPlan}
            className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download My Plan
          </button>
          <button
            onClick={() => { setStep(0); setCompleted(false); }}
            className="border-2 border-green-700 text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Edit Plan
          </button>
        </div>
        <p className="text-xs text-green-600 mt-4">
          ⚠️ This plan is stored only in your browser. Download it or clear this page when done.
        </p>
      </div>
    );
  }

  const currentStep = steps[step];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Progress */}
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-700">
            Step {step + 1} of {steps.length}
          </span>
          <span className="text-sm text-purple-500">{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex-shrink-0 w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${
                i === step
                  ? 'bg-purple-600 text-white'
                  : i < step
                  ? 'bg-purple-200 text-purple-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
              aria-label={s.title}
              title={s.title}
            >
              {i < step ? '✓' : s.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">{currentStep.icon}</span>
          <h3 className="text-xl font-bold text-gray-900">{currentStep.title}</h3>
        </div>

        {/* Step content */}
        {step === 0 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Where can you go if you need to leave quickly? Think of a neighbor, friend, shelter, or public place.
            </p>
            <textarea
              value={plan.safePlace}
              onChange={(e) => setPlan({ ...plan, safePlace: e.target.value })}
              placeholder="e.g. My friend Sarah's house at 12 Oak Street, or the local women's shelter on Main Road"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-28"
              aria-label="Safe place to go"
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              List 2–3 people you trust completely. Include their phone numbers. These are people who can help or who you can call.
            </p>
            <textarea
              value={plan.trustedPeople}
              onChange={(e) => setPlan({ ...plan, trustedPeople: e.target.value })}
              placeholder="e.g. Sarah (friend): 555-1234&#10;Mom: 555-5678&#10;Local shelter: 0800-XXX-XXX"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32"
              aria-label="Trusted people and their numbers"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Check off what you have ready in an emergency bag hidden somewhere safe (or at a trusted person&apos;s home).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bagItems.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                    plan.emergencyBag.includes(item)
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={plan.emergencyBag.includes(item)}
                    onChange={() => toggleBagItem(item)}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              A safe word is a code you can use with a trusted person to signal you need help without being overheard.
              Choose something that sounds innocent but means &quot;call for help&quot;.
            </p>
            <input
              type="text"
              value={plan.safeWord}
              onChange={(e) => setPlan({ ...plan, safeWord: e.target.value })}
              placeholder="e.g. 'I need to borrow flour' or 'How is the garden?'"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Safe word or phrase"
            />
            <p className="text-xs text-gray-400 mt-2">
              Share this word/phrase privately with your trusted person and agree what they should do when they hear it.
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Plan your escape route from your home. Know which door/window to use and where to go immediately.
            </p>
            <textarea
              value={plan.exitRoute}
              onChange={(e) => setPlan({ ...plan, exitRoute: e.target.value })}
              placeholder="e.g. Use back door, take the alley to the main street, go to the bus stop on Pine Ave and take bus 12 to Sarah's"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-28"
              aria-label="Exit route plan"
            />
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Write down the most important local helpline for your country so you can reach it quickly.
              Search above in the &quot;Find Help in Your Country&quot; section.
            </p>
            <input
              type="text"
              value={plan.localHotline}
              onChange={(e) => setPlan({ ...plan, localHotline: e.target.value })}
              placeholder="e.g. National DV Hotline: 1-800-799-7233 (available 24/7)"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Local hotline number"
            />
            <p className="text-xs text-gray-400 mt-2">International emergency: 112</p>
          </div>
        )}

        {step === 6 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Financial independence is key. Note any savings or resources you can access independently.
            </p>
            <textarea
              value={plan.bankAccount}
              onChange={(e) => setPlan({ ...plan, bankAccount: e.target.value })}
              placeholder="e.g. I have a separate savings account at [bank]. PIN stored in my email drafts. Emergency cash is in the bag."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-28"
              aria-label="Financial safety notes"
            />
          </div>
        )}

        {step === 7 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Check which important documents you have copies of (in a safe place outside your home, or digitally).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {docItems.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                    plan.importantDocs.includes(item)
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={plan.importantDocs.includes(item)}
                    onChange={() => toggleDocItem(item)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              Note what you need to do to secure your online accounts and delete digital traces if needed.
            </p>
            <textarea
              value={plan.onlineAccounts}
              onChange={(e) => setPlan({ ...plan, onlineAccounts: e.target.value })}
              placeholder="e.g. Change email password, turn off location sharing on phone, log out of shared devices, check for tracking apps"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-28"
              aria-label="Online safety notes"
            />
          </div>
        )}

        {step === 9 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              If you have children, plan for them. Who do you take with you? Is there a school code word?
              Who can collect them in an emergency?
            </p>
            <textarea
              value={plan.children}
              onChange={(e) => setPlan({ ...plan, children: e.target.value })}
              placeholder="e.g. Take both children. School contact: 555-9999. Aunt Jane (555-7777) can collect them. Code word at school: 'blue umbrella'."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-28"
              aria-label="Plan for children"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setCompleted(true)}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors"
            >
              Complete Plan ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
