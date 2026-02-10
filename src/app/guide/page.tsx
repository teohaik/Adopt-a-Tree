'use client';

import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">
          {t.guideTitle}
        </h1>

        {/* Watering by size */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {t.guideSizeTitle}
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-3xl">🌱</span>
              <div>
                <p className="font-medium text-green-800">{t.guideSmallTree}</p>
                <p className="text-green-600">{t.guideSmallTreeAmount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-3xl">🌲</span>
              <div>
                <p className="font-medium text-yellow-800">{t.guideMediumTree}</p>
                <p className="text-yellow-600">{t.guideMediumTreeAmount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-3xl">🌳</span>
              <div>
                <p className="font-medium text-blue-800">{t.guideLargeTree}</p>
                <p className="text-blue-600">{t.guideLargeTreeAmount}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
            {t.guideWaterNote}
          </p>
        </section>

        {/* Watering frequency */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {t.guideFrequencyTitle}
          </h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b bg-green-50">
                  <td className="p-3 font-medium">{t.guideAprilMay}</td>
                  <td className="p-3">{t.guideAprilMayFreq}</td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="p-3 font-medium">{t.guideJune}</td>
                  <td className="p-3">{t.guideJuneFreq}</td>
                </tr>
                <tr className="border-b bg-orange-50">
                  <td className="p-3 font-medium">{t.guideJulyAug}</td>
                  <td className="p-3">
                    {t.guideJulyAugFreq}<br/>
                    <span className="text-gray-500">{t.guideJulyAugNote}</span>
                  </td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="p-3 font-medium">{t.guideSeptember}</td>
                  <td className="p-3">{t.guideSeptemberFreq}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium">{t.guideOctMarch}</td>
                  <td className="p-3">{t.guideOctMarchFreq}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 text-red-600">
            <p>{t.guideAvoid1}</p>
            <p>{t.guideAvoid2}</p>
            <p>{t.guideAvoid3}</p>
          </div>
        </section>

        {/* Pruning */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {t.guidePruningTitle}
          </h2>
          <p className="text-gray-500 text-sm mb-4">{t.guidePruningOptional}</p>

          <p className="mb-3 text-gray-700">{t.guidePruningWhen}</p>
          <ul className="list-disc list-inside mb-4 text-gray-600 space-y-1">
            <li>{t.guidePruningItem1}</li>
            <li>{t.guidePruningItem2}</li>
          </ul>

          <p className="mb-2 font-medium">{t.guidePruningCanCut}</p>
          <ul className="list-disc list-inside mb-4 text-gray-600 space-y-1">
            <li>{t.guidePruningCond1}</li>
            <li>{t.guidePruningCond2}</li>
            <li>{t.guidePruningCond3}</li>
          </ul>

          <p className="text-red-600 font-medium">{t.guidePruningWarning}</p>
          <p className="text-gray-600 mt-2">{t.guidePruningContact}<a href="#contact" className="text-green-600 hover:underline">{t.guidePruningContactLink}</a></p>
        </section>

        {/* Observation */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {t.guideObservationTitle}
          </h2>

          <p className="mb-3 text-gray-700"><a href="#contact" className="text-green-600 hover:underline">{t.guideObservationIntroLink}</a>{t.guideObservationIntro}</p>
          <ul className="space-y-2 text-gray-600">
            <li>• {t.guideObservation1}</li>
            <li>• {t.guideObservation2}</li>
            <li>• {t.guideObservation3}</li>
            <li>• {t.guideObservation4}</li>
            <li>• {t.guideObservation5}</li>
          </ul>

          <p className="mt-4 text-red-600 font-medium">
            {t.guideNoChemicals}
          </p>
        </section>

        {/* Your role */}
        <section className="bg-green-100 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            {t.guideRoleTitle}
          </h2>

          <p className="mb-3 text-green-700">{t.guideRoleIntro}</p>
          <ul className="space-y-2 text-green-800">
            <li>{t.guideRole1}</li>
            <li>{t.guideRole2}</li>
            <li>{t.guideRole3}</li>
          </ul>

          <p className="mt-6 text-center text-green-800 font-semibold text-lg">
            {t.guideRoleClosing}
          </p>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            {t.guideContactTitle}
          </h2>

          <div id="contact" className="text-gray-700 space-y-2">
            <p className="font-semibold text-green-800">{t.guideContactDepartment}</p>
            <div className="mt-3">
              <p className="text-sm text-gray-500">{t.guideContactHead}</p>
              <p className="font-medium">ΙΑΚΩΒΙΔΟΥ ΜΑΡΙΑ</p>
              <p className="text-sm text-gray-600">{t.guideContactHeadTitle}</p>
            </div>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-gray-500">{t.guideContactTel}</span>{' '}
                <a href="tel:2310478013" className="text-green-600 hover:underline">2310 478013</a>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <a href="mailto:m.iakovidou@thermi.gov.gr" className="text-green-600 hover:underline">
                  m.iakovidou@thermi.gov.gr
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block text-green-600 hover:text-green-800 underline"
          >
            {t.guideBackLink}
          </a>
        </div>
      </div>
    </main>
  );
}
