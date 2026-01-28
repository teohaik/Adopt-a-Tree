'use client';

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">
          💧 Οδηγός Ποτίσματος Δέντρων
        </h1>

        {/* Watering by size */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            Ανάλογα με το μέγεθος
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🟢</span>
              <div>
                <p className="font-medium text-green-800">Μικρό δέντρο (νεοφυτεμένο / έως 2 μ.)</p>
                <p className="text-green-600">➡️ 15–25 λίτρα κάθε πότισμα</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-medium text-yellow-800">Μεσαίο δέντρο (2–5 μ.)</p>
                <p className="text-yellow-600">➡️ 30–50 λίτρα κάθε πότισμα</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🔵</span>
              <div>
                <p className="font-medium text-blue-800">Μεγάλο δέντρο (άνω των 5 μ.)</p>
                <p className="text-blue-600">➡️ 60–100 λίτρα κάθε πότισμα</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
            📌 Ρίχνουμε το νερό αργά, γύρω από τον κορμό, για να πάει σε βάθος.
          </p>
        </section>

        {/* Watering frequency */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            📅 Συχνότητα ποτίσματος
          </h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b bg-green-50">
                  <td className="p-3 font-medium">Απρίλιος – Μάιος</td>
                  <td className="p-3">Κάθε 7–10 ημέρες</td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="p-3 font-medium">Ιούνιος</td>
                  <td className="p-3">Κάθε 5–7 ημέρες</td>
                </tr>
                <tr className="border-b bg-orange-50">
                  <td className="p-3 font-medium">Ιούλιος – Αύγουστος</td>
                  <td className="p-3">
                    Κάθε 3–4 ημέρες<br/>
                    <span className="text-gray-500">Πρωί νωρίς ή μετά τη δύση</span>
                  </td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="p-3 font-medium">Σεπτέμβριος</td>
                  <td className="p-3">Κάθε 7 ημέρες</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="p-3 font-medium">Οκτώβριος – Μάρτιος</td>
                  <td className="p-3">Όχι πότισμα, εκτός παρατεταμένης ανομβρίας</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 text-red-600">
            <p>❌ Όχι λίγο νερό κάθε μέρα</p>
            <p>❌ Όχι μεσημέρι</p>
            <p>❌ Όχι με πίεση στον κορμό</p>
          </div>
        </section>

        {/* Pruning */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            ✂️ Λαίμαργα κλαδιά
          </h2>
          <p className="text-gray-500 text-sm mb-4">(μόνο απλές περιπτώσεις και προαιρετικά)</p>

          <p className="mb-3 text-gray-700">Κατά το πότισμα, αν δείτε:</p>
          <ul className="list-disc list-inside mb-4 text-gray-600 space-y-1">
            <li>Λεπτά κλαδιά χαμηλά</li>
            <li>Κλαδιά που εμποδίζουν τη διέλευση πεζών</li>
          </ul>

          <p className="mb-2 text-green-700 font-medium">✅ Μπορείτε να τα κόψετε μόνο αν:</p>
          <ul className="list-disc list-inside mb-4 text-gray-600 space-y-1">
            <li>είναι λεπτά</li>
            <li>κόβονται με απλό κλαδευτήρι</li>
            <li>δεν χρειάζεται σκάλα</li>
          </ul>

          <p className="text-red-600 font-medium">❗ Δεν κόβουμε χοντρά ή ψηλά κλαδιά</p>
          <p className="text-gray-600 mt-2">➡️ Σε αμφιβολία, ενημερώνουμε τον Δήμο Θέρμης</p>
        </section>

        {/* Observation */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            👀 Παρατήρηση δέντρου
          </h2>

          <p className="mb-3 text-gray-700"><a href="#contact" className="text-green-600 hover:underline">Ενημερώστε τον Δήμο</a> αν δείτε:</p>
          <ul className="space-y-2 text-gray-600">
            <li>• κιτρίνισμα ή ξήρανση φύλλων</li>
            <li>• στίγματα, κολλώδεις ουσίες, ρητίνες</li>
            <li>• σπασμένα ή επικίνδυνα κλαδιά</li>
            <li>• έντονη κλίση ή αστάθεια</li>
            <li>• βανδαλισμούς</li>
          </ul>

          <p className="mt-4 text-red-600 font-medium">
            🚫 Δεν βάζουμε λιπάσματα ή φάρμακα
          </p>
        </section>

        {/* Your role */}
        <section className="bg-green-100 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            🤝 Ο ρόλος σας
          </h2>

          <p className="mb-3 text-green-700">Με το πότισμα και την παρατήρηση:</p>
          <ul className="space-y-2 text-green-800">
            <li>🌳 προστατεύετε το πράσινο της Θέρμης</li>
            <li>🌡️ μειώνετε τη θερμική καταπόνηση</li>
            <li>☀️ βοηθάτε τα δέντρα να επιβιώσουν το καλοκαίρι</li>
          </ul>

          <p className="mt-6 text-center text-green-800 font-semibold text-lg">
            🌱 Ένα πότισμα τη φορά, κάνουμε τη διαφορά.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">
            📞 Επικοινωνία
          </h2>

          <div id="contact" className="text-gray-700 space-y-2">
            <p className="font-semibold text-green-800">Διεύθυνση Πρασίνου Δήμου Θέρμης</p>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Προϊσταμένη:</p>
              <p className="font-medium">ΙΑΚΩΒΙΔΟΥ ΜΑΡΙΑ</p>
              <p className="text-sm text-gray-600">ΓΕΩΠΟΝΟΣ Π.Ε. MSc</p>
            </div>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-gray-500">Τηλ:</span>{' '}
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
            ← Επιστροφή στον χάρτη
          </a>
        </div>
      </div>
    </main>
  );
}
