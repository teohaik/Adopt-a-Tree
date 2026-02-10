export type Language = 'el' | 'en';

export interface Translations {
  // Main page
  mainTitle: string;
  mainSubtitle: string;
  successTitle: string;
  successMessage: string;
  howItWorks: string;
  step1Title: string;
  step1Desc: string;
  step1DescHighlight: string;
  step1DescSuffix: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  adoptedCount: string;
  othersLabel: string;
  yourTreesLabel: string;
  emailFilterPlaceholder: string;
  filterButton: string;
  cancelButton: string;
  addTreeButton: string;
  responsibilitiesTitle: string;
  responsibility1: string;
  responsibility2: string;
  responsibility3: string;
  responsibility4: string;
  wateringGuideLink: string;
  errorCreationFailed: string;

  // PinForm
  adoptTreeFormTitle: string;
  locationLabel: string;
  yourNameLabel: string;
  namePlaceholder: string;
  yourEmailLabel: string;
  treeLabelLabel: string;
  treeLabelPlaceholder: string;
  submittingButton: string;
  adoptTreeButton: string;
  disclaimer: string;

  // TreeMap
  loadingMap: string;
  restrictedAreaTitle: string;
  restrictedAreaMessage: string;
  yourTree: string;
  placementBanner: string;

  // Guide page
  guideTitle: string;
  guideSizeTitle: string;
  guideSmallTree: string;
  guideSmallTreeAmount: string;
  guideMediumTree: string;
  guideMediumTreeAmount: string;
  guideLargeTree: string;
  guideLargeTreeAmount: string;
  guideWaterNote: string;
  guideFrequencyTitle: string;
  guideAprilMay: string;
  guideAprilMayFreq: string;
  guideJune: string;
  guideJuneFreq: string;
  guideJulyAug: string;
  guideJulyAugFreq: string;
  guideJulyAugNote: string;
  guideSeptember: string;
  guideSeptemberFreq: string;
  guideOctMarch: string;
  guideOctMarchFreq: string;
  guideAvoid1: string;
  guideAvoid2: string;
  guideAvoid3: string;
  guidePruningTitle: string;
  guidePruningOptional: string;
  guidePruningWhen: string;
  guidePruningItem1: string;
  guidePruningItem2: string;
  guidePruningCanCut: string;
  guidePruningCond1: string;
  guidePruningCond2: string;
  guidePruningCond3: string;
  guidePruningWarning: string;
  guidePruningContact: string;
  guidePruningContactLink: string;
  guideObservationTitle: string;
  guideObservationIntro: string;
  guideObservationIntroLink: string;
  guideObservation1: string;
  guideObservation2: string;
  guideObservation3: string;
  guideObservation4: string;
  guideObservation5: string;
  guideNoChemicals: string;
  guideRoleTitle: string;
  guideRoleIntro: string;
  guideRole1: string;
  guideRole2: string;
  guideRole3: string;
  guideRoleClosing: string;
  guideContactTitle: string;
  guideContactDepartment: string;
  guideContactHead: string;
  guideContactHeadTitle: string;
  guideContactTel: string;
  guideBackLink: string;

  // Email
  emailFromName: string;
  emailSubject: (label: string) => string;
  emailTitle: string;
  emailGreeting: (name: string) => string;
  emailCongrats: string;
  emailDetailsTitle: string;
  emailLabelField: string;
  emailLocationField: string;
  emailResponsibilitiesTitle: string;
  emailResp1: string;
  emailResp2: string;
  emailResp3: string;
  emailResp4: string;
  emailViewTrees: string;
  emailViewMaps: string;
  emailWateringGuide: string;
  emailThankYou: string;
  emailFooter: string;
  emailFooterContact: string;

  // API errors
  errorRestrictedZone: string;
}

export const translations: Record<Language, Translations> = {
  el: {
    // Main page
    mainTitle: 'Υιοθέτησε ένα Δέντρο στη Θέρμη',
    mainSubtitle: 'Βοήθησε να πρασινίσει η κοινότητά μας υιοθετώντας και φροντίζοντας ένα δέντρο',
    successTitle: 'Το δέντρο υιοθετήθηκε επιτυχώς!',
    successMessage: 'Ελέγξτε το email σας για επιβεβαίωση και λεπτομέρειες για το δέντρο σας.',
    howItWorks: 'Πώς Λειτουργεί',
    step1Title: '1. Διάλεξε Τοποθεσία',
    step1Desc: 'Κάνε κλικ στο κουμπί και στη συνέχεια ',
    step1DescHighlight: 'στη μωβ ',
    step1DescSuffix: 'περιοχή του χάρτη όπου θα ήθελες να υιοθετήσεις ένα δέντρο.',
    step2Title: '2. Συμπλήρωσε Στοιχεία',
    step2Desc: 'Εισήγαγε το όνομά σου, email και δώσε μια ετικέτα στο δέντρο σου',
    step3Title: '3. Φρόντισέ Το',
    step3Desc: 'Λάβε επιβεβαίωση και δεσμεύσου να ποτίζεις και να συντηρείς το δέντρο σου',
    adoptedCount: 'Υιοθετήθηκαν',
    othersLabel: 'Άλλα',
    yourTreesLabel: 'Δικά Σου',
    emailFilterPlaceholder: 'Email για φίλτρο',
    filterButton: 'Φίλτρο',
    cancelButton: 'Ακύρωση',
    addTreeButton: 'Πρόσθεσε Δέντρο',
    responsibilitiesTitle: 'Οι Υποχρεώσεις Σου',
    responsibility1: 'Πότισε το δέντρο σου τακτικά, ειδικά κατά τις ξηρές περιόδους',
    responsibility2: 'Παρακολούθησε την υγεία του δέντρου και ανάφερε τυχόν προβλήματα στις τοπικές αρχές',
    responsibility3: 'Κράτησε την περιοχή γύρω από το δέντρο καθαρή',
    responsibility4: 'Γίνε πρεσβευτής των δέντρων και ενθάρρυνε άλλους να συμμετάσχουν',
    wateringGuideLink: 'Δες τον οδηγό ποτίσματος',
    errorCreationFailed: 'Αποτυχία δημιουργίας δέντρου',

    // PinForm
    adoptTreeFormTitle: 'Υιοθέτησε ένα Δέντρο',
    locationLabel: 'Τοποθεσία:',
    yourNameLabel: 'Το Όνομά Σου',
    namePlaceholder: 'π.χ. Γιάννης Παπαδόπουλος',
    yourEmailLabel: 'Το Email Σου',
    treeLabelLabel: 'Ετικέτα Δέντρου',
    treeLabelPlaceholder: 'π.χ. Δρυς κοντά στο πάρκο',
    submittingButton: 'Υποβολή...',
    adoptTreeButton: 'Υιοθέτησε Δέντρο',
    disclaimer: 'Υιοθετώντας αυτό το δέντρο, συμφωνείς να το συντηρείς και να το ποτίζεις τακτικά. Θα λάβεις email επιβεβαίωσης με την τοποθεσία του δέντρου.',

    // TreeMap
    loadingMap: 'Φόρτωση χάρτη...',
    restrictedAreaTitle: '❌ Μη Επιτρεπόμενη Περιοχή',
    restrictedAreaMessage: 'Η φύτευση δέντρων επιτρέπεται μόνο στις οριοθετημένες περιοχές που έχει ορίσει ο Δήμος.',
    yourTree: '🌳 Το Δέντρο Σου',
    placementBanner: 'Κάνε κλικ στο χάρτη για να τοποθετήσεις το δέντρο σου. \n Επιτρέπεται τοποθέτηση μόνο στις οριοθετημένες περιοχές',

    // Guide page
    guideTitle: '💧 Οδηγός Ποτίσματος Δέντρων',
    guideSizeTitle: 'Ανάλογα με το μέγεθος',
    guideSmallTree: 'Μικρό δέντρο (νεοφυτεμένο / έως 2 μ.)',
    guideSmallTreeAmount: '➡️ 15–25 λίτρα κάθε πότισμα',
    guideMediumTree: 'Μεσαίο δέντρο (2–5 μ.)',
    guideMediumTreeAmount: '➡️ 30–50 λίτρα κάθε πότισμα',
    guideLargeTree: 'Μεγάλο δέντρο (άνω των 5 μ.)',
    guideLargeTreeAmount: '➡️ 60–100 λίτρα κάθε πότισμα',
    guideWaterNote: '📌 Ρίχνουμε το νερό αργά, γύρω από τον κορμό, για να πάει σε βάθος.',
    guideFrequencyTitle: '📅 Συχνότητα ποτίσματος',
    guideAprilMay: 'Απρίλιος – Μάιος',
    guideAprilMayFreq: 'Κάθε 7–10 ημέρες',
    guideJune: 'Ιούνιος',
    guideJuneFreq: 'Κάθε 5–7 ημέρες',
    guideJulyAug: 'Ιούλιος – Αύγουστος',
    guideJulyAugFreq: 'Κάθε 3–4 ημέρες',
    guideJulyAugNote: 'Πρωί νωρίς ή μετά τη δύση',
    guideSeptember: 'Σεπτέμβριος',
    guideSeptemberFreq: 'Κάθε 7 ημέρες',
    guideOctMarch: 'Οκτώβριος – Μάρτιος',
    guideOctMarchFreq: 'Όχι πότισμα, εκτός παρατεταμένης ανομβρίας',
    guideAvoid1: '❌ Όχι λίγο νερό κάθε μέρα',
    guideAvoid2: '❌ Όχι μεσημέρι',
    guideAvoid3: '❌ Όχι με πίεση στον κορμό',
    guidePruningTitle: '✂️ Λαίμαργα κλαδιά',
    guidePruningOptional: '(μόνο απλές περιπτώσεις και προαιρετικά)',
    guidePruningWhen: 'Κατά το πότισμα, αν δείτε:',
    guidePruningItem1: 'Λεπτά κλαδιά χαμηλά',
    guidePruningItem2: 'Κλαδιά που εμποδίζουν τη διέλευση πεζών',
    guidePruningCanCut: 'Μπορείτε να τα κόψετε μόνο αν:',
    guidePruningCond1: 'είναι λεπτά',
    guidePruningCond2: 'κόβονται με απλό κλαδευτήρι',
    guidePruningCond3: 'δεν χρειάζεται σκάλα',
    guidePruningWarning: '❗ Δεν κόβουμε χοντρά ή ψηλά κλαδιά',
    guidePruningContact: '➡️ Σε αμφιβολία, επικοινωνούμε με τη ',
    guidePruningContactLink: 'διεύθυνση πρασίνου',
    guideObservationTitle: '👀 Παρατήρηση δέντρου',
    guideObservationIntro: ' αν δείτε:',
    guideObservationIntroLink: 'Ενημερώστε τον Δήμο',
    guideObservation1: 'κιτρίνισμα ή ξήρανση φύλλων',
    guideObservation2: 'στίγματα, κολλώδεις ουσίες, ρητίνες',
    guideObservation3: 'σπασμένα ή επικίνδυνα κλαδιά',
    guideObservation4: 'έντονη κλίση ή αστάθεια',
    guideObservation5: 'βανδαλισμούς',
    guideNoChemicals: '🚫 Δεν βάζουμε λιπάσματα ή φάρμακα',
    guideRoleTitle: '🤝 Ο ρόλος σας',
    guideRoleIntro: 'Με το πότισμα και την παρατήρηση:',
    guideRole1: '🌳 προστατεύετε το πράσινο της Θέρμης',
    guideRole2: '🌡️ μειώνετε τη θερμική καταπόνηση',
    guideRole3: '☀️ βοηθάτε τα δέντρα να επιβιώσουν το καλοκαίρι',
    guideRoleClosing: '🌱 Ένα πότισμα τη φορά, κάνουμε τη διαφορά.',
    guideContactTitle: '📞 Επικοινωνία',
    guideContactDepartment: 'Διεύθυνση Πρασίνου Δήμου Θέρμης',
    guideContactHead: 'Προϊσταμένη:',
    guideContactHeadTitle: 'ΓΕΩΠΟΝΟΣ Π.Ε. MSc',
    guideContactTel: 'Τηλ:',
    guideBackLink: '← Επιστροφή στον χάρτη',

    // Email
    emailFromName: 'Υιοθέτησε ένα Δέντρο',
    emailSubject: (label: string) => `Επιβεβαίωση Υιοθεσίας: ${label}`,
    emailTitle: '🌳 Επιβεβαίωση Υιοθεσίας Δέντρου!',
    emailGreeting: (name: string) => `Αγαπητέ/ή ${name},`,
    emailCongrats: 'Συγχαρητήρια! Υιοθέτησες επιτυχώς ένα δέντρο μέσω του προγράμματος Υιοθέτησε ένα Δέντρο.',
    emailDetailsTitle: 'Λεπτομέρειες Δέντρου:',
    emailLabelField: 'Ετικέτα:',
    emailLocationField: 'Τοποθεσία:',
    emailResponsibilitiesTitle: 'Οι Υποχρεώσεις Σου:',
    emailResp1: 'Πότισε το δέντρο σου τακτικά, ειδικά κατά τις ξηρές περιόδους',
    emailResp2: 'Παρακολούθησε την υγεία του δέντρου και ανάφερε τυχόν προβλήματα',
    emailResp3: 'Κράτησε την περιοχή γύρω από το δέντρο καθαρή',
    emailResp4: 'Γίνε πρεσβευτής των δέντρων και ενθάρρυνε άλλους να συμμετάσχουν!',
    emailViewTrees: 'Δες τα Δέντρα Σου',
    emailViewMaps: 'Προβολή στο Google Maps',
    emailWateringGuide: 'Οδηγός Ποτίσματος',
    emailThankYou: 'Ευχαριστούμε που συμβάλλεις σε μια πιο πράσινη Θέρμη Θεσσαλονίκης!',
    emailFooter: 'Αυτό είναι ένα αυτόματο μήνυμα από το Υιοθέτησε ένα Δέντρο',
    emailFooterContact: 'Για οποιαδήποτε ερώτηση, επικοινώνησε μαζί μας.',

    // API errors
    errorRestrictedZone: 'Η φύτευση δέντρων επιτρέπεται μόνο στις ορισμένες περιοχές που έχει καθορίσει ο Δήμος. Παρακαλώ επιλέξτε μια τοποθεσία εντός των πράσινων περιοχών.',
  },

  en: {
    // Main page
    mainTitle: 'Adopt a Tree in Thermi',
    mainSubtitle: 'Help green our community by adopting and caring for a tree',
    successTitle: 'Tree adopted successfully!',
    successMessage: 'Check your email for confirmation and details about your tree.',
    howItWorks: 'How It Works',
    step1Title: '1. Choose a Location',
    step1Desc: 'Click the button and then on the ',
    step1DescHighlight: 'purple ',
    step1DescSuffix: 'area of the map where you\'d like to adopt a tree.',
    step2Title: '2. Fill in Your Details',
    step2Desc: 'Enter your name, email and give a label to your tree',
    step3Title: '3. Take Care of It',
    step3Desc: 'Receive confirmation and commit to watering and maintaining your tree',
    adoptedCount: 'Adopted',
    othersLabel: 'Others',
    yourTreesLabel: 'Yours',
    emailFilterPlaceholder: 'Email to filter',
    filterButton: 'Filter',
    cancelButton: 'Cancel',
    addTreeButton: 'Add Tree',
    responsibilitiesTitle: 'Your Responsibilities',
    responsibility1: 'Water your tree regularly, especially during dry periods',
    responsibility2: 'Monitor the tree\'s health and report any issues to local authorities',
    responsibility3: 'Keep the area around the tree clean',
    responsibility4: 'Become a tree ambassador and encourage others to participate',
    wateringGuideLink: 'See the watering guide',
    errorCreationFailed: 'Failed to create tree',

    // PinForm
    adoptTreeFormTitle: 'Adopt a Tree',
    locationLabel: 'Location:',
    yourNameLabel: 'Your Name',
    namePlaceholder: 'e.g. John Smith',
    yourEmailLabel: 'Your Email',
    treeLabelLabel: 'Tree Label',
    treeLabelPlaceholder: 'e.g. Oak near the park',
    submittingButton: 'Submitting...',
    adoptTreeButton: 'Adopt Tree',
    disclaimer: 'By adopting this tree, you agree to maintain and water it regularly. You will receive a confirmation email with the tree\'s location.',

    // TreeMap
    loadingMap: 'Loading map...',
    restrictedAreaTitle: '❌ Restricted Area',
    restrictedAreaMessage: 'Tree planting is only allowed in designated areas marked by the Municipality.',
    yourTree: '🌳 Your Tree',
    placementBanner: 'Click on the map to place your tree. \n Placement is only allowed in designated areas',

    // Guide page
    guideTitle: '💧 Tree Watering Guide',
    guideSizeTitle: 'According to size',
    guideSmallTree: 'Small tree (newly planted / up to 2 m)',
    guideSmallTreeAmount: '➡️ 15–25 liters per watering',
    guideMediumTree: 'Medium tree (2–5 m)',
    guideMediumTreeAmount: '➡️ 30–50 liters per watering',
    guideLargeTree: 'Large tree (over 5 m)',
    guideLargeTreeAmount: '➡️ 60–100 liters per watering',
    guideWaterNote: '📌 Pour water slowly, around the trunk, so it reaches deep into the soil.',
    guideFrequencyTitle: '📅 Watering frequency',
    guideAprilMay: 'April – May',
    guideAprilMayFreq: 'Every 7–10 days',
    guideJune: 'June',
    guideJuneFreq: 'Every 5–7 days',
    guideJulyAug: 'July – August',
    guideJulyAugFreq: 'Every 3–4 days',
    guideJulyAugNote: 'Early morning or after sunset',
    guideSeptember: 'September',
    guideSeptemberFreq: 'Every 7 days',
    guideOctMarch: 'October – March',
    guideOctMarchFreq: 'No watering, except during prolonged drought',
    guideAvoid1: '❌ Don\'t water a little every day',
    guideAvoid2: '❌ Don\'t water at noon',
    guideAvoid3: '❌ Don\'t spray directly on the trunk',
    guidePruningTitle: '✂️ Sucker branches',
    guidePruningOptional: '(simple cases only, optional)',
    guidePruningWhen: 'During watering, if you notice:',
    guidePruningItem1: 'Thin low-growing branches',
    guidePruningItem2: 'Branches obstructing pedestrian passage',
    guidePruningCanCut: 'You may trim them only if:',
    guidePruningCond1: 'they are thin',
    guidePruningCond2: 'they can be cut with simple pruning shears',
    guidePruningCond3: 'no ladder is needed',
    guidePruningWarning: '❗ Do not cut thick or high branches',
    guidePruningContact: '➡️ When in doubt, contact the ',
    guidePruningContactLink: 'green services department',
    guideObservationTitle: '👀 Tree observation',
    guideObservationIntro: ' if you notice:',
    guideObservationIntroLink: 'Inform the Municipality',
    guideObservation1: 'yellowing or drying of leaves',
    guideObservation2: 'stains, sticky substances, resins',
    guideObservation3: 'broken or dangerous branches',
    guideObservation4: 'severe leaning or instability',
    guideObservation5: 'vandalism',
    guideNoChemicals: '🚫 Do not apply fertilizers or pesticides',
    guideRoleTitle: '🤝 Your role',
    guideRoleIntro: 'Through watering and observation:',
    guideRole1: '🌳 you protect Thermi\'s greenery',
    guideRole2: '🌡️ you reduce heat stress',
    guideRole3: '☀️ you help trees survive the summer',
    guideRoleClosing: '🌱 One watering at a time, we make a difference.',
    guideContactTitle: '📞 Contact',
    guideContactDepartment: 'Green Services Department, Municipality of Thermi',
    guideContactHead: 'Director:',
    guideContactHeadTitle: 'AGRONOMIST B.Sc. MSc',
    guideContactTel: 'Tel:',
    guideBackLink: '← Back to map',

    // Email
    emailFromName: 'Adopt a Tree',
    emailSubject: (label: string) => `Adoption Confirmation: ${label}`,
    emailTitle: '🌳 Tree Adoption Confirmation!',
    emailGreeting: (name: string) => `Dear ${name},`,
    emailCongrats: 'Congratulations! You have successfully adopted a tree through the Adopt a Tree program.',
    emailDetailsTitle: 'Tree Details:',
    emailLabelField: 'Label:',
    emailLocationField: 'Location:',
    emailResponsibilitiesTitle: 'Your Responsibilities:',
    emailResp1: 'Water your tree regularly, especially during dry periods',
    emailResp2: 'Monitor the tree\'s health and report any issues',
    emailResp3: 'Keep the area around the tree clean',
    emailResp4: 'Become a tree ambassador and encourage others to participate!',
    emailViewTrees: 'See Your Trees',
    emailViewMaps: 'View on Google Maps',
    emailWateringGuide: 'Watering Guide',
    emailThankYou: 'Thank you for contributing to a greener Thermi, Thessaloniki!',
    emailFooter: 'This is an automated message from Adopt a Tree',
    emailFooterContact: 'For any questions, please contact us.',

    // API errors
    errorRestrictedZone: 'Tree planting is only allowed in designated areas marked by the Municipality. Please select a location within the marked areas.',
  },
};
