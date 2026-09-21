import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (text: string, fallback?: string) => string;
  isHindi: boolean;
}

// Master comprehensive dictionary for Crime Matrix Portal (1042 entries)
export const TRANSLATIONS: Record<string, string> = {
  'Registered Officers': 'पंजीकृत अधिकारी',
  'State Govt': 'राज्य सरकार',
  'Registration Schedule': 'पंजीकरण अनुसूची',
  'District Level': 'जिला स्तर',
  'Subdivision Level': 'उप-प्रभाग स्तर',
  'Write the exact description for what purpose you are contacting this police station (e.g. Suspect physical description, vehicle license number, last known location ping, request for CCTV backup, joint raid coordination, arrest warrant execution assistance)...': 'इस पुलिस स्टेशन से संपर्क करने का सटीक उद्देश्य लिखें (उदा. संदिग्ध का शारीरिक विवरण, वाहन संख्या, अंतिम ज्ञात स्थान, सीसीटीवी फुटेज बैकअप, संयुक्त छापेमारी समन्वय, गिरफ्तारी वारंट निष्पादन)...',
  'Specify precise legal reason (e.g. Trace escaping suspects, verify stolen vehicle transit at highway toll plaza, authenticate SIM identity for ransom caller, correlate server attack payload)...': 'सटीक कानूनी कारण बताएं (उदा. भागते हुए संदिग्धों को ट्रैक करना, हाईवे टोल प्लाजा पर चोरी के वाहन के पारगमन का सत्यापन, फिरौती मांगने वाले के सिम की पुष्टि)...',
  'Weekly Crime Hotspot Strategy & DSP Command Briefing': 'साप्ताहिक अपराध हॉटस्पॉट रणनीति एवं डीएसपी कमान ब्रीफिंग',
  'Cyber Forensics Server Dump Inspection': 'साइबर फोरेंसिक सर्वर डंप निरीक्षण',
  'On-Site Evidence Re-inspection & Ballistics Re-enactment': 'साइट पर साक्ष्य का पुनः निरीक्षण एवं बैलिस्टिक री-एनेक्टमेंट',
  'Inter-State Narcotics Raid Coordination with Gujarat Police': 'गुजरात पुलिस के साथ अंतर-राज्यीय मादक पदार्थ छापेमारी समन्वय',
  'Pending Case Dossiers & Biometric Ledger Sign-off': 'लंबित केस दस्तावेज़ एवं बायोमेट्रिक लेज़र हस्ताक्षर',
  'No registered police case was found matching your account. Once a Police Host Inspector or DSP logs a case with your name as the complainant/victim, it will appear here with full transparency.': 'आपके खाते से मेल खाता कोई पंजीकृत पुलिस केस नहीं मिला। जैसे ही कोई पुलिस होस्ट इंस्पेक्टर या डीएसपी शिकायतकर्ता/पीड़ित के रूप में आपका नाम दर्ज करेगा, वह यहाँ प्रदर्शित हो जाएगा।',
  'This portal provides you with direct transparency into the active progress of your case, the assigned police investigation team, and upcoming Court Hearing deadlines.': 'यह पोर्टल आपको अपने केस की सक्रिय प्रगति, आवंटित पुलिस जांच दल और आगामी अदालत सुनवाई समयसीमा की सीधी पारदर्शिता प्रदान करता है।',
  '2. Unauthorized disclosure of classified case files or suspect profiles is strictly prohibited under the Official Secrets Act and Cyber Security Regulations.': '2. शासकीय गोपनीयता अधिनियम और साइबर सुरक्षा विनियमों के तहत गोपनीय केस फ़ाइलों या संदिग्ध प्रोफाइलों का अनधिकृत प्रकटीकरण सख्त वर्जित है।',
  '1. I solemnly affirm that all credentials, service IDs, and personal records provided are authentic and issued by competent state/judicial authorities.': '1. मैं सत्यनिष्ठा से पुष्टि करता हूँ कि प्रदान किए गए सभी क्रेडेंशियल, सर्विस आईडी और व्यक्तिगत रिकॉर्ड प्रामाणिक हैं।',
  'Assigned FIR investigations, officer team dispatch, and suspect profiles are managed separately in the dedicated Case Management module.': 'आवंटित एफआईआर जांच, पुलिस टीम प्रतिनियुक्ति और संदिग्ध प्रोफाइल अलग केस प्रबंधन मॉड्यूल में प्रबंधित की जाती हैं।',
  'Specify the evidence files, chargesheet sections, or witness statements that the police team must present during this hearing session...': 'उन साक्ष्य फ़ाइलों, चार्जशीट धाराओं या गवाहों के बयानों को निर्दिष्ट करें जिन्हें पुलिस टीम को इस सुनवाई सत्र के दौरान प्रस्तुत करना होगा...',
  'Assigned case dossiers, evidence records, and court hearing dates are managed separately in the dedicated Case Management module.': 'आवंटित केस दस्तावेज़, साक्ष्य रिकॉर्ड और अदालत सुनवाई तिथियां अलग केस प्रबंधन मॉड्यूल में प्रबंधित की जाती हैं।',
  'Allow this victim account to see real-time case updates, investigation progress, court hearings, and timeline for Case': 'इस पीड़ित खाते को वास्तविक समय के केस अपडेट, जांच प्रगति, अदालत की सुनवाई और समयरेखा देखने की अनुमति दें',
  'Write what happened in detail, including dates, names, transaction IDs, device IMEI, or sequence of events...': 'जो हुआ उसका विस्तार से वर्णन करें, जिसमें तारीखें, नाम, लेन-देन आईडी, डिवाइस आईएमईआई या घटनाओं का क्रम शामिल हो...',
  'Manage DSP assigned cases, dispatch Police Officers & Advocates, verify applicants, and track suspects.': 'डीएसपी द्वारा आवंटित मामलों का प्रबंधन करें, पुलिस अधिकारियों व अधिवक्ताओं को नियुक्त करें, आवेदकों का सत्यापन करें और संदिग्धों पर नज़र रखें।',
  'Supervisory oversight of all departmental FIRs, active investigations, and judicial proceedings.': 'सभी विभागीय एफआईआर, सक्रिय जांच और न्यायिक कार्यवाही का पर्यवेक्षी नियंत्रण।',
  'Enter field inquiry findings, complainant identity verification notes, or reason for remark...': 'फील्ड जांच निष्कर्ष, शिकायतकर्ता पहचान सत्यापन नोट्स, या टिप्पणी का कारण दर्ज करें...',
  '🔒 Case is Solved — Suspect management is locked for this case. Existing records are read-only.': '🔒 केस हल हो चुका है — इस केस के लिए संदिग्ध प्रबंधन लॉक है। मौजूदा रिकॉर्ड केवल पढ़ने योग्य हैं।',
  'Master jurisdiction crime overview, case creation, host assignment & suspect intelligence.': 'मुख्य क्षेत्राधिकार अपराध अवलोकन, नया केस सृजन, होस्ट आवंटन और संदिग्ध खुफिया जानकारी।',
  'Assigned case repository, citizen e-FIR verification, field logs, and crime analytics.': 'आवंटित केस रिपॉजिटरी, नागरिक ई-एफआईआर सत्यापन, फील्ड लॉग और अपराध विश्लेषण।',
  'Assigned court cases, legal filings, evidentiary records, and jurisdiction analytics.': 'आवंटित अदालती मामले, कानूनी फाइलिंग, साक्ष्य रिकॉर्ड और क्षेत्राधिकार विश्लेषण।',
  'Search cases by Case ID (e.g. CR-2026), Crime Type, Victim Name, or Location...': 'केस आईडी (जैसे CR-2026), अपराध का प्रकार, पीड़ित का नाम, या स्थान से खोजें...',
  'View and manage all active cases, suspect tracking, and investigation progress': 'सभी सक्रिय मामलों, संदिग्ध ट्रैकिंग और जांच प्रगति को देखें और प्रबंधित करें',
  '🔒 Case is Solved — Timeline entries are locked and cannot be added or edited.': '🔒 केस हल हो चुका है — समयरेखा प्रविष्टियां लॉक हैं और उन्हें जोड़ा या संपादित नहीं किया जा सकता।',
  'Category Verified: Eligible for Online FIR Registration & Digital Processing': 'श्रेणी सत्यापित: ऑनलाइन एफआईआर पंजीकरण एवं डिजिटल प्रसंस्करण हेतु पात्र',
  '⚠️ No police officers assigned to this team yet. Click \'Assign Team\' below.': '⚠️ अभी तक इस टीम में कोई पुलिस अधिकारी नियुक्त नहीं है। नीचे \'टीम नियुक्त करें\' पर क्लिक करें।',
  'Describe relevance to case, key observations, or chain of custody notes...': 'केस से प्रासंगिकता, मुख्य टिप्पणियां या साक्ष्य संरक्षण नोट्स लिखें...',
  'State Cyber & Crime Branch • Confidential Judicial Investigation Record': 'राज्य साइबर एवं अपराध शाखा • गोपनीय न्यायिक जांच रिकॉर्ड',
  'Click on any node to view its direct connections in the network panel.': 'नेटवर्क पैनल में सीधे कनेक्शन देखने के लिए किसी भी नोड पर क्लिक करें।',
  'Search complaints by Complainant Name, ID, Crime Category, Location...': 'शिकायतकर्ता के नाम, आईडी, अपराध श्रेणी, स्थान द्वारा खोजें...',
  'Assign or update investigation team from available Police Officers': 'उपलब्ध पुलिस अधिकारियों में से जांच दल नियुक्त या अपडेट करें',
  'Enter detailed facts, findings, evidence notes, or action taken...': 'विस्तृत तथ्य, निष्कर्ष, साक्ष्य नोट्स, या की गई कार्रवाई दर्ज करें...',
  'Details of crime, time of occurrence, recovered evidence notes...': 'अपराध का विवरण, घटना का समय, बरामद साक्ष्य नोट्स...',
  'Require fast biometric check before downloading forensic evidence': 'फोरेंसिक साक्ष्य डाउनलोड करने से पहले त्वरित बायोमेट्रिक जांच अनिवार्य करें',
  'Enter custom crime type (e.g., Arson, Extortion, Smuggling...)': 'कस्टम अपराध प्रकार दर्ज करें (उदा. आगजनी, जबरन वसूली, तस्करी...)',
  'Search available officers by name, badge, department, rank...': 'नाम, बैज, विभाग, पद द्वारा उपलब्ध अधिकारी खोजें...',
  'e.g. Downtown Central Financial Sector, Sector 12, Metro City': 'उदा. डाउनटाउन सेंट्रल फाइनेंशियल सेक्टर, सेक्टर 12, मेट्रो सिटी',
  'e.g. Flat 402, Block C, Silver Heights, Sector 14, Metro City': 'उदा. फ्लैट 402, ब्लॉक सी, सिल्वर हाइट्स, सेक्टर 14, मेट्रो सिटी',
  'Try adjusting your completion status filter or search query.': 'कृपया अपना स्थिति फ़िल्टर या खोज क्वेरी समायोजित करें।',
  'Suspect name, phone, physical appearance, vehicle number...': 'संदिग्ध का नाम, फ़ोन, शारीरिक बनावट, वाहन नंबर...',
  'State Cyber & Crime Branch • Official Investigation Record': 'राज्य साइबर एवं अपराध शाखा • आधिकारिक जांच रिकॉर्ड',
  'Enter complete residential address with landmark and city': 'लैंडमार्क और शहर सहित पूरा आवासीय पता दर्ज करें',
  'No cross-case node links registered for this suspect yet.': 'इस संदिग्ध के लिए अभी तक कोई क्रॉस-केस नोड लिंक दर्ज नहीं है।',
  'Officer Login': 'अधिकारी लॉगिन',
  'Victim Login': 'पीड़ित लॉगिन',
  'Agency Identification / Username': 'एजेंसी पहचान / उपयोगकर्ता नाम',
  'Start Iris Scan': 'आईरिस स्कैन शुरू करें',
  'START IRIS SCAN': 'आईरिस स्कैन शुरू करें',
  'Fingerprint': 'फिंगरप्रिंट',
  'Fingerprint Identification & AFIS Matcher': 'फिंगरप्रिंट पहचान एवं एएफआईएस मिलानकर्ता',
  'Biometric Fingerprint Scanner & Matching Engine': 'बायोमेट्रिक फिंगरप्रिंट स्कैनर एवं मिलान इंजन',
  'Scan & Match Fingerprint': 'फिंगरप्रिंट स्कैन और मिलान करें',
  'No match': 'कोई मिलान नहीं',
  'MATCH FOUND': 'मिलान मिला',
  'Positive Suspect Identification': 'सकारात्मक संदिग्ध पहचान',
  'Attached Fingerprint': 'संलग्न फिंगरप्रिंट',
  'Suspect Biometric Fingerprint Repository': 'संदिग्ध बायोमेट्रिक फिंगरप्रिंट भंडार',
  'Test in Scanner': 'स्कैनर में टेस्ट करें',
  'Suspect Biometric Fingerprint Card': 'संदिग्ध बायोमेट्रिक फिंगरप्रिंट कार्ड',
  'Attach Image File': 'इमेज फ़ाइल संलग्न करें',
  'Live Optical Pad': 'लाइव ऑप्टिकल पैड',
  'Iris Verified (Biometric Confirmed)': 'आईरिस सत्यापित (बायोमेट्रिक पुष्ट)',
  'Official Iris Biometric Scanner': 'आधिकारिक आईरिस बायोमेट्रिक स्कैनर',
  'Complete biometric eye scan to authorize officer clearance': 'अधिकारी अनुमति हेतु बायोमेट्रिक नेत्र स्कैन पूरा करें',
  'Proceed to Login': 'लॉगिन के लिए आगे बढ़ें',
  'Show password': 'पासवर्ड दिखाएं',
  'Hide password': 'पासवर्ड छिपाएं',
  'Registers formal FIR and notifies DSP for Host assignment': 'औपचारिक एफआईआर दर्ज करता है एवं होस्ट आवंटन हेतु डीएसपी को सूचित करता है',
  'Search by Case ID, Case Name, Victim, Host, or Officer...': 'केस आईडी, नाम, पीड़ित, होस्ट, या अधिकारी द्वारा खोजें...',
  'Add notes, officer comments, or investigation remarks...': 'नोट्स, अधिकारी टिप्पणियां या जांच संबंधी बातें जोड़ें...',
  'All files are securely visible to assigned team members.': 'सभी फ़ाइलें आवंटित टीम के सदस्यों को सुरक्षित रूप से दिखाई देती हैं।',
  'e.g. City Sessions Court Hall 4B, Metro District Complex': 'उदा. सिटी सेशंस कोर्ट हॉल 4B, मेट्रो डिस्ट्रिक्ट कॉम्प्लेक्स',
  'Key initial incident facts, venue, suspected damages...': 'घटना के मुख्य प्रारंभिक तथ्य, स्थान, संदिग्ध नुकसान...',
  'Official Crime Matrix Incident Verification & Enrolment': 'आधिकारिक क्राइम मैट्रिक्स घटना सत्यापन एवं नामांकन',
  'Play tone on incoming e-FIR complaint & court reminders': 'आने वाली ई-एफआईआर शिकायत एवं अदालत अनुस्मारक पर टोन बजाएं',
  'Clean white and slate styling for daylight readability': 'दिन के उजाले में पढ़ने योग्य स्वच्छ सफेद और स्लेट स्टाइलिंग',
  'NEXT: Investigation in progress — awaiting next update': 'अगला: जांच जारी है — अगले अपडेट की प्रतीक्षा है',
  'Remove existing officers/advocates or assign new ones.': 'मौजूदा अधिकारियों/अधिवक्ताओं को हटाएं या नए नियुक्त करें।',
  'High contrast dark canvas with amber security accents': 'अंबर सुरक्षा एक्सेंट के साथ उच्च कंट्रास्ट डार्क कैनवास',
  'No cases currently assigned to your advocate profile.': 'वर्तमान में आपकी अधिवक्ता प्रोफ़ाइल को कोई मामला आवंटित नहीं है।',
  'Case Progress & Hearing Schedules (Transparent View)': 'केस प्रगति एवं सुनवाई अनुसूची (पारदर्शी दृश्य)',
  'Display inter-state amber alerts on top of dashboard': 'डैशबोर्ड के शीर्ष पर अंतर-राज्यीय एम्बर अलर्ट प्रदर्शित करें',
  'Drag and drop evidence file here, or click to browse': 'साक्ष्य फ़ाइल यहाँ खींचकर छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
  'Search cases by title, ID, crime type, or suspect...': 'शीर्षक, आईडी, अपराध के प्रकार, या संदिग्ध द्वारा मामले खोजें...',
  'Click to view details, Double click to center tree': 'विवरण देखने हेतु क्लिक करें, ट्री केंद्र में लाने हेतु डबल क्लिक करें',
  'No suspects currently linked to this case record.': 'वर्तमान में इस केस रिकॉर्ड से कोई संदिग्ध जुड़ा नहीं है।',
  'Personnel Credential & Registration Verification': 'कार्मिक क्रेडेंशियल एवं पंजीकरण सत्यापन',
  'Additional guidelines, team members to carry...': 'अतिरिक्त दिशा-निर्देश, साथ ले जाने वाले टीम सदस्य...',
  'Contact Other State Police Stations & Issue APB': 'अन्य राज्य पुलिस स्टेशनों से संपर्क करें एवं एपीबी जारी करें',
  'Judicial Transparency & Target Deadline Notice:': 'न्यायिक पारदर्शिता एवं लक्ष्य समयसीमा सूचना:',
  'No Node Connections Branching From This Suspect': 'इस संदिग्ध से कोई नोड कनेक्शन नहीं जुड़ता है',
  'Street, Landmark, Sector, Area or Landmark name': 'सड़क, लैंडमार्क, सेक्टर, क्षेत्र या लैंडमार्क का नाम',
  'e.g. Crime Scene Visited, Witness Statements...': 'उदा. अपराध स्थल का दौरा, गवाहों के बयान...',
  'e.g. Koramangala Police Station / Cyber Cell HQ': 'उदा. कोरामंगला पुलिस स्टेशन / साइबर सेल मुख्यालय',
  'e.g. Sessions Court Room 4B or Crime Branch Lab': 'उदा. सेशंस कोर्ट रूम 4B या क्राइम ब्रांच लैब',
  '── EMERGENCY / IMMEDIATE DISPATCH CATEGORIES ──': '── आपातकालीन / त्वरित प्रेषण श्रेणियां ──',
  'Case updates will be enabled upon registration': 'पंजीकरण पर केस अपडेट सक्षम हो जाएंगे',
  'Case updates & court update access authorized': 'केस अपडेट और अदालत सुनवाई अपडेट पहुंच अधिकृत',
  'Limited access about the case updation': 'केस अपडेशन के बारे में सीमित पहुंच',
  'Allow this victim account limited access to see live case updates, investigation progress, and court hearing updates for Case': 'इस पीड़ित खाते को केस के लाइव केस अपडेट, जांच प्रगति और अदालती सुनवाई के अपडेट देखने के लिए सीमित पहुंच की अनुमति दें',
  'Victim will be able to see live case updates, investigation timeline, and court hearing updates.': 'पीड़ित लाइव केस अपडेट, जांच समयरेखा और अदालत की सुनवाई के अपडेट देख सकेगा।',
  'Dial or type the registered Case ID': 'पंजीकृत केस आईडी डायल या टाइप करें',
  'Dial / Enter Case ID (e.g. CR-2026-8942)': 'केस आईडी डायल / दर्ज करें (उदा. CR-2026-8942)',
  'Available Cases in Station:': 'थाने में उपलब्ध मामले:',
  'Case Dossier Found': 'मामले की फाइल मिल गई',
  'Please enter the Case ID above to display the case details and authorize limited access for case updates.': 'कृपया मामले का विवरण प्रदर्शित करने और केस अपडेट के लिए सीमित पहुंच अधिकृत करने हेतु ऊपर केस आईडी दर्ज करें।',
  'Please check the Case ID and try again, or click one of the available Case IDs above.': 'कृपया केस आईडी जांचें और पुन: प्रयास करें, या ऊपर उपलब्ध केस आईडी में से किसी एक पर क्लिक करें।',
  'Selected for Victim Access:': 'पीड़ित पहुंच हेतु चयनित:',
  'Complete Registration & Authorize Direct Login': 'पंजीकरण पूर्ण करें एवं सीधे लॉगिन को अधिकृत करें',
  'Known aliases, associates, key danger level...': 'ज्ञात उपनाम, सहयोगी, मुख्य खतरा स्तर...',
  'Search alerts, police station, or reference...': 'अलर्ट, पुलिस स्टेशन, या संदर्भ खोजें...',
  'e.g. Crime scene revisit & witness interview': 'उदा. अपराध स्थल का पुनः दौरा एवं गवाह साक्षात्कार',
  'All available police officers are assigned.': 'सभी उपलब्ध पुलिस अधिकारी नियुक्त हैं।',
  'Assign or change station host for this case': 'इस केस के लिए थाना होस्ट नियुक्त या परिवर्तित करें',
  'Authenticating Section 91 CrPC police token': 'धारा 91 दंड प्रक्रिया संहिता पुलिस टोकन प्रमाणीकरण जारी',
  'CRIME MATRIX SYSTEM • OFFICIAL CASE DOSSIER': 'क्राइम मैट्रिक्स प्रणाली • आधिकारिक केस दस्तावेज़',
  'Chargesheet & Court Presentation Submission': 'चार्जशीट एवं अदालत प्रस्तुति',
  'Witness name, contact number, or address...': 'गवाह का नाम, संपर्क नंबर, या पता...',
  '• Must contain exactly 10 numerical digits.': '• ठीक 10 संख्यात्मक अंक होने चाहिए।',
  'Click any profile to auto-fill credentials': 'क्रेडेंशियल स्वतः भरने के लिए किसी प्रोफ़ाइल पर क्लिक करें',
  'Direct Police Station Clearance Authority:': 'सीधा थाना मंजूरी प्राधिकारी:',
  'JUDICIAL INFORMATION SYSTEM • CASE DOSSIER': 'न्यायिक सूचना प्रणाली • केस दस्तावेज़ (डोज़ियर)',
  'Next Court Hearing & Case Release Schedule': 'अगली अदालत सुनवाई और केस रिहाई अनुसूची',
  'Host Main Police Administration Dashboard': 'होस्ट मुख्य पुलिस प्रशासन डैशबोर्ड',
  'Official Biometric Iris Pattern Enrolment': 'आधिकारिक बायोमेट्रिक आईरिस पैटर्न नामांकन',
  'Police Officer Field Investigation Portal': 'पुलिस अधिकारी फील्ड जांच पोर्टल',
  'Add custom investigation feature/step...': 'कस्टम जांच सुविधा/चरण जोड़ें...',
  'Authenticating & Verifying Biometrics...': 'प्रमाणीकरण एवं बायोमेट्रिक्स सत्यापन जारी...',
  'Iris Biometric Scan Enrolled & Verified!': 'आईरिस बायोमेट्रिक स्कैन नामांकित एवं सत्यापित!',
  'Official Portal Oath & Privacy Covenant:': 'आधिकारिक पोर्टल शपथ एवं गोपनीयता अनुबंध:',
  'Victim / Complainant Name * (Compulsory)': 'पीड़ित / शिकायतकर्ता का नाम * (अनिवार्य)',
  'Citizen Complaints (E-FIR Verification)': 'नागरिक शिकायतें (ई-एफआईआर सत्यापन)',
  'Connected Case(s) for Victim Dashboard:': 'पीड़ित डैशबोर्ड हेतु जुड़े मामले:',
  'Enter full official residential address': 'पूरा आधिकारिक आवासीय पता दर्ज करें',
  'Search by Suspect ID, Name, or Crime...': 'संदिग्ध आईडी, नाम, या अपराध द्वारा खोजें...',
  'Security CAPTCHA Verified Successfully!': 'सुरक्षा कैप्चा सफलतापूर्वक सत्यापित हुआ!',
  'Type or select State (e.g. Maharashtra)': 'राज्य टाइप करें या चुनें (उदा. महाराष्ट्र)',
  'e.g. ₹45,000 INR or Apple iPhone 14 Pro': 'उदा. ₹45,000 या एप्पल आईफोन 14 प्रो',
  '★ CAUTION: HIGH SECURITY REGISTRATION ★': '★ सावधानी: उच्च सुरक्षा पंजीकरण ★',
  'Advocate Legal Briefs & Defense Portal': 'अधिवक्ता कानूनी ब्रीफ एवं रक्षा पोर्टल',
  'Judicial & Crime Records Access System': 'न्यायिक एवं अपराध रिकॉर्ड पहुंच प्रणाली',
  'Law Enforcement Officer Iris Enrolment': 'कानून प्रवर्तन अधिकारी आईरिस नामांकन',
  'Recorded sequentially into case record': 'केस रिकॉर्ड में क्रमिक रूप से दर्ज',
  'Sessions Court, Metro Judicial Complex': 'सत्र न्यायालय, मेट्रो न्यायिक परिसर',
  'All available advocates are assigned.': 'सभी उपलब्ध अधिवक्ता नियुक्त हैं।',
  'Click or drop another file to replace': 'बदलने के लिए क्लिक करें या दूसरी फ़ाइल छोड़ें',
  'DSP (Deputy Superintendent of Police)': 'डीएसपी (पुलिस उप अधीक्षक)',
  'Go to the website and watch the video': 'वेबसाइट पर जाएं और वीडियो देखें',
  'IP logs, proxy nodes, cloud forensics': 'आईपी लॉग, प्रॉक्सी नोड्स, क्लाउड फोरेंसिक',
  'Iris Biometric Gate on Evidence Files': 'साक्ष्य फ़ाइलों पर आईरिस बायोमेट्रिक गेट',
  'Live Data Feed / Intelligence Payload': 'लाइव डेटा फीड / खुफिया जानकारी',
  'Notifications & Verification Requests': 'सूचनाएं एवं सत्यापन अनुरोध',
  'Paste suspect image URL (https://...)': 'संदिग्ध छवि यूआरएल (https://...) पेस्ट करें',
  'Citizen & Victim Transparency Portal': 'नागरिक एवं पीड़ित पारदर्शिता पोर्टल',
  'Contacting Nodal Database Gateway...': 'नोडल डेटाबेस गेटवे से संपर्क जारी...',
  'Official Police Investigation Record': 'आधिकारिक पुलिस जांच रिकॉर्ड',
  'Perform Iris Scan to Verify Identity': 'पहचान सत्यापित करने के लिए आईरिस स्कैन करें',
  'Secure Tunnel: Encrypted 256-bit SHA': 'सुरक्षित टनल: एन्क्रिप्टेड 256-बिट SHA',
  'e.g. Armed Robbery, Extortion, Fraud': 'उदा. सशस्त्र डकैती, जबरन वसूली, धोखाधड़ी',
  '── ONLINE FIR ELIGIBLE CATEGORIES ──': '── ऑनलाइन एफआईआर हेतु पात्र श्रेणियां ──',
  'Add or update notes and comments...': 'नोट्स और टिप्पणियां जोड़ें या अपडेट करें...',
  'Delete assigned host from this case': 'इस केस से नियुक्त होस्ट को हटाएं',
  'High Priority Inter-State Broadcast': 'उच्च प्राथमिकता अंतर-राज्यीय प्रसारण',
  'Lock dashboard terminal if inactive': 'यदि निष्क्रिय हो तो डैशबोर्ड टर्मिनल लॉक करें',
  'Marks complaint as Fake or Spurious': 'शिकायत को फर्जी या जाली चिह्नित करता है',
  'No APBs match your filter criteria.': 'आपकी फ़िल्टर शर्तों से मेल खाने वाला कोई एपीबी नहीं मिला।',
  'Notifications & Applicant Approvals': 'सूचनाएं एवं आवेदक स्वीकृति',
  'Open Binary Tree Network visualizer': 'बाइनरी ट्री नेटवर्क विज़ुअलाइज़र खोलें',
  'Professional / Departmental Details': 'व्यावसायिक / विभागीय विवरण',
  'Upload Supporting Documents / Proof': 'सहायक दस्तावेज / प्रमाण अपलोड करें',
  'e.g. Ballistics_Analysis_Report.pdf': 'उदा. बैलिस्टिक_विश्लेषण_रिपोर्ट.pdf',
  'e.g. Co-conspirator, Hawala Partner': 'उदा. सह-षड्यंत्रकारी, हवाला साझेदार',
  '★ JUDICIAL INVESTIGATION TERMINAL ★': '★ न्यायिक जांच टर्मिनल ★',
  'Click to Browse Suspect Image File': 'संदिग्ध छवि फ़ाइल ब्राउज़ करने हेतु क्लिक करें',
  'DSP Command Headquarters Dashboard': 'डीएसपी कमान मुख्यालय डैशबोर्ड',
  'Event Description & Observations *': 'घटना का विवरण एवं टिप्पणियां *',
  'Purpose & Detailed Intel Broadcast': 'उद्देश्य एवं विस्तृत खुफिया प्रसारण',
  'Register Citizen Complaint (e-FIR)': 'नागरिक शिकायत (ई-एफआईआर) दर्ज करें',
  'SIM registration & ID verification': 'सिम पंजीकरण एवं आईडी सत्यापन',
  'Secure Judicial Information System': 'सुरक्षित न्यायिक सूचना प्रणाली',
  'Type Police Department / Firm Name': 'पुलिस विभाग / फर्म का नाम टाइप करें',
  'e.g. City Central Bank Vault Heist': 'उदा. सिटी सेंट्रल बैंक वॉल्ट डकैती',
  'e.g. Operation GoldVault Syndicate': 'उदा. ऑपरेशन गोल्डवॉल्ट सिंडिकेट',
  'e.g. Ramesh Kadam (Security Guard)': 'उदा. रमेश कदम (सुरक्षा गार्ड)',
  'हिन्दी में बदलें (Switch to Hindi)': 'हिन्दी में बदलें (Switch to Hindi)',
  '── Select Case / Crime Category ──': '── केस / अपराध श्रेणी चुनें ──',
  '(Minimum 2 letters in each field)': '(प्रत्येक फ़ील्ड में न्यूनतम 2 अक्षर)',
  'Add, Remove or Edit Case Suspects': 'केस संदिग्ध जोड़ें, हटाएं या संपादित करें',
  'Immediate Emergency (Sec 91 CrPC)': 'त्वरित आपातकाल (धारा 91 दंड प्रक्रिया संहिता)',
  'No evidence exhibits recorded yet': 'अभी तक कोई साक्ष्य दर्ज नहीं किया गया है',
  'Official Judicial Target Deadline': 'आधिकारिक न्यायिक लक्ष्य समयसीमा',
  'Search case name, ID, or crime...': 'केस का नाम, आईडी या अपराध खोजें...',
  'Assistant Police Inspector (API)': 'सहायक पुलिस इंस्पेक्टर (API)',
  'Case Description & FIR Summary *': 'केस विवरण एवं एफआईआर सारांश *',
  'Court Order / Judicial Clearance': 'अदालत का आदेश / न्यायिक मंजूरी',
  'Full Case Description & Overview': 'पूर्ण केस विवरण एवं अवलोकन',
  'Investigative Background / Notes': 'जांच पृष्ठभूमि / नोट्स',
  'Open Binary Tree Node Visualizer': 'बाइनरी ट्री नोड विज़ुअलाइज़र खोलें',
  'Toll-free, inbound/outbound logs': 'टोल-फ्री, इनबाउंड/आउटबाउंड लॉग',
  'Type your Department / Firm name': 'अपने विभाग / फर्म का नाम टाइप करें',
  'e.g. Sector 14, Metro Docks area': 'उदा. सेक्टर 14, मेट्रो डॉक्स क्षेत्र',
  'Assign Station Host Inspector *': 'थाना होस्ट इंस्पेक्टर नियुक्त करें *',
  'Authorized for Victim Dashboard': 'पीड़ित डैशबोर्ड के लिए अधिकृत',
  'Cases Assigned to Legal Counsel': 'कानूनी सलाहकार को आवंटित मामले',
  'Citizen Services & Registration': 'नागरिक सेवाएं एवं पंजीकरण',
  'Download / View Attachment File': 'संलग्नक फ़ाइल डाउनलोड करें / देखें',
  'Evidence Collected & Documented': 'साक्ष्य संग्रह एवं दस्तावेजीकरण',
  'Get limited access of this case': 'इस मामले की सीमित पहुंच प्राप्त करें',
  'JUDICIAL INVESTIGATION TERMINAL': 'न्यायिक जांच टर्मिनल',
  'Last Known Address / Location *': 'अंतिम ज्ञात पता / स्थान *',
  'No evidence files uploaded yet.': 'अभी तक कोई साक्ष्य फ़ाइल अपलोड नहीं की गई है।',
  'Pending Personnel Registrations': 'लंबित कार्मिक पंजीकरण',
  'Security Verification (CAPTCHA)': 'सुरक्षा सत्यापन (कैप्चा)',
  'Suspect Intelligence Repository': 'संदिग्ध खुफिया रिपॉजिटरी',
  'Suspect Investigation Completed': 'संदिग्ध जांच पूर्ण',
  'Suspect Management Intelligence': 'संदिग्ध प्रबंधन खुफिया जानकारी',
  'View Full Judicial Case Dossier': 'पूर्ण न्यायिक केस दस्तावेज़ देखें',
  'e.g. applicant.ramesh@gmail.com': 'उदा. applicant.ramesh@gmail.com',
  'Add Daily Duty / Schedule Task': 'दैनिक ड्यूटी / कार्यसूची कार्य जोड़ें',
  'Assign / Reassign Station Host': 'थाना होस्ट नियुक्त / पुनः नियुक्त करें',
  'Clock time or approximate text': 'घड़ी का समय या अनुमानित समय',
  'Crime Distribution by Category': 'श्रेणी अनुसार अपराध वितरण',
  'Evidence Correlation Completed': 'साक्ष्य सहसंबंध पूर्ण',
  'Keep under preliminary inquiry': 'प्रारंभिक जांच के अधीन रखें',
  'Manage Case Investigation Team': 'केस जांच दल का प्रबंधन करें',
  'Mobile triangulation & azimuth': 'मोबाइल त्रिभुजीकरण एवं अज़ीमुथ',
  'Specify custom relationship...': 'कस्टम संबंध निर्दिष्ट करें...',
  'Type your Official Designation': 'अपना आधिकारिक पदनाम टाइप करें',
  '(Describe sequence of events)': '(घटनाओं के क्रम का वर्णन करें)',
  'Address / Last Known Location': 'पता / अंतिम ज्ञात स्थान',
  'Assistant Sub-Inspector (ASI)': 'सहायक उप-निरीक्षक (ASI)',
  'Audio Alarms & Priority Beeps': 'ऑडियो अलार्म एवं प्राथमिकता बीप',
  'Citizen Complainant Enrolment': 'नागरिक शिकायतकर्ता नामांकन',
  'Delete / Remove Evidence File': 'साक्ष्य फ़ाइल हटाएं / निकालें',
  'Enter remarks or action notes': 'टिप्पणी या कार्रवाई नोट दर्ज करें',
  'Forensic Lab Reports Received': 'फोरेंसिक लैब रिपोर्ट प्राप्त',
  'Investigation Progress Status': 'जांच प्रगति स्थिति',
  'Investigation Report Prepared': 'जांच रिपोर्ट तैयार',
  'Officer / Investigator Name *': 'अधिकारी / जांचकर्ता का नाम *',
  'SYSTEM VERSION: v4.2.0-STABLE': 'प्रणाली संस्करण: v4.2.0-स्थिर',
  'Scheduled Hearing Date & Time': 'निर्धारित सुनवाई तिथि एवं समय',
  'Select Station Host Inspector': 'थाना होस्ट इंस्पेक्टर चुनें',
  'Submit & Approve Registration': 'पंजीकरण सबमिट और स्वीकृत करें',
  'Supports PNG, JPG, JPEG, WEBP': 'पीएनजी, जेपीजी, जेपीईजी, वेबपी समर्थित',
  'e.g. officer.ramesh@gmail.com': 'उदा. officer.ramesh@gmail.com',
  '★ AUTHORIZED PERSONNEL ONLY ★': '★ केवल अधिकृत कार्मिक ★',
  '★ CRIME SCENE EVIDENCE ZONE ★': '★ अपराध स्थल साक्ष्य क्षेत्र ★',
  'Badge ID / Bar License No. *': 'बैज आईडी / बार लाइसेंस नं. *',
  'Citizen / Victim Complainant': 'नागरिक / पीड़ित शिकायतकर्ता',
  'Click pin to inspect dossier': 'दस्तावेज़ की जांच करने हेतु पिन पर क्लिक करें',
  'Close / Back to Login Portal': 'बंद करें / लॉगिन पोर्टल पर वापस जाएं',
  'Confirm Upload & Notify Team': 'अपलोड की पुष्टि करें एवं टीम को सूचित करें',
  'Court Hearing Live Countdown': 'अदालत सुनवाई लाइव उलटी गिनती',
  'Economic Offences Wing (EOW)': 'आर्थिक अपराध शाखा (EOW)',
  'Enter 10-digit mobile number': '10 अंकों का मोबाइल नंबर दर्ज करें',
  'Enter secure portal password': 'सुरक्षित पोर्टल पासवर्ड दर्ज करें',
  'Flash APB (Immediate Action)': 'फ्लैश एपीबी (त्वरित कार्रवाई)',
  'GOVERNMENT CREDENTIAL RECORD': 'सरकारी क्रेडेंशियल रिकॉर्ड',
  'Government of India Intranet': 'भारत सरकार इंट्रानेट',
  'Hearing Notes / Instructions': 'सुनवाई नोट्स / निर्देश',
  'No Service Badge ID Required': 'कोई सेवा बैज आईडी आवश्यक नहीं है',
  'Official Username / Badge ID': 'आधिकारिक यूज़रनेम / बैज आईडी',
  'Select Your Registered Case:': 'अपना पंजीकृत केस चुनें:',
  'Standard Station Requisition': 'मानक थाना मांग-पत्र',
  'Top Intercepted Connections:': 'प्रमुख इंटरसेप्टेड कनेक्शन:',
  'Victim / Citizen Complainant': 'पीड़ित / नागरिक शिकायतकर्ता',
  'View node list & connections': 'नोड सूची एवं कनेक्शन देखें',
  'e.g. INS-8812 or BAR-MH-4421': 'उदा. INS-8812 या BAR-MH-4421',
  'e.g. Rajesh Sharma (Manager)': 'उदा. राजेश शर्मा (प्रबंधक)',
  '★ POLICE LINE DO NOT CROSS ★': '★ पुलिस लाइन पार न करें ★',
  '🔒 Case Solved (Vault Locked)': '🔒 केस हल हो चुका है (वॉल्ट लॉक)',
  'Aadhaar / National ID Proof': 'आधार / राष्ट्रीय पहचान पत्र प्रमाण',
  'Active All Points Bulletins': 'सक्रिय ऑल पॉइंट्स बुलेटिन',
  'Assigned Investigation Team': 'आवंटित जांच दल',
  'CAUTION: HIGH SECURITY AREA': 'सावधानी: उच्च सुरक्षा क्षेत्र',
  'Case Description & Overview': 'केस विवरण एवं अवलोकन',
  'Citizen Complaints (E-FIR )': 'नागरिक शिकायतें (ई-एफआईआर)',
  'Complaint (E-FIR)': 'शिकायत (ई-एफआईआर)',
  'Dark Mode (Midnight Police)': 'डार्क मोड (मिडनाइट पुलिस)',
  'Flash APB Emergency Banners': 'फ्लैश एपीबी आपातकालीन बैनर',
  'Identity Proof & Biometrics': 'पहचान प्रमाण एवं बायोमेट्रिक्स',
  'Officer Iris Biometric Scan': 'अधिकारी आईरिस बायोमेट्रिक स्कैन',
  'Open Search & Filters Panel': 'खोज एवं फ़िल्टर पैनल खोलें',
  'RTO owner, FASTag & chassis': 'आरटीओ मालिक, फास्टैग एवं चेसिस',
  'Return to Officer Dashboard': 'अधिकारी डैशबोर्ड पर वापस जाएं',
  'Select Official Designation': 'आधिकारिक पदनाम चुनें',
  'Select Target State (India)': 'लक्षित राज्य चुनें (भारत)',
  'Submit Alert & Dispatch APB': 'अलर्ट सबमिट करें एवं एपीबी भेजें',
  'Upload New Evidence / Photo': 'नया साक्ष्य / फोटो अपलोड करें',
  'Victim / Complainant Name *': 'पीड़ित / शिकायतकर्ता का नाम *',
  'Witness Statements Recorded': 'गवाहों के बयान दर्ज',
  'e.g. Inspector Ramesh Kumar': 'उदा. इंस्पेक्टर रमेश कुमार',
  'e.g. Inspector Suresh Kadam': 'उदा. इंस्पेक्टर सुरेश कदम',
  '(Must end with @gmail.com)': '(अंत में @gmail.com होना चाहिए)',
  'Assign to Host Inspector *': 'होस्ट इंस्पेक्टर को नियुक्त करें *',
  'Auto-Lock Inactivity Guard': 'स्वतः-लॉक निष्क्रियता सुरक्षा गार्ड',
  'Case Timeline & Milestones': 'केस समयरेखा और मील के पत्थर',
  'Citizen Complaints (E-FIR)': 'नागरिक शिकायतें (ई-एफआईआर)',
  'Complaint / FIR Registered': 'शिकायत / एफआईआर दर्ज',
  'Create New Suspect Profile': 'नया संदिग्ध प्रोफ़ाइल बनाएं',
  'Cyber Hacking & Ransomware': 'साइबर हैकिंग एवं रैंसमवेयर',
  'DD/MM/YYYY e.g. 14/09/2026': 'दिन/माह/वर्ष उदा. 14/09/2026',
  'Generated OTP (Demo Mode):': 'उत्पन्न ओटीपी (डेमो मोड):',
  'Iris Verification Required': 'आईरिस सत्यापन आवश्यक',
  'New Personnel Registration': 'नया कार्मिक पंजीकरण',
  'Open Profile Details Panel': 'प्रोफ़ाइल विवरण पैनल खोलें',
  'Police Sub-Inspector (PSI)': 'पुलिस उप-निरीक्षक (PSI)',
  'Query live database bridge': 'लाइव डेटाबेस ब्रिज से क्वेरी करें',
  'Selected for Victim Access': 'पीड़ित पहुंच के लिए चयनित',
  'Specify Other Crime Type *': 'अन्य अपराध प्रकार निर्दिष्ट करें *',
  'TRUTH • EVIDENCE • JUSTICE': 'सत्य • साक्ष्य • न्याय',
  'Technical Handler / Hacker': 'तकनीकी संचालक / हैकर',
  'Victim Transparency Portal': 'पीड़ित पारदर्शिता पोर्टल',
  'e.g. 10 Aug 2026, 11:15 AM': 'उदा. 10 अगस्त 2026, 11:15 पूर्वाह्न',
  '★ FORENSIC LOGS VERIFIED ★': '★ फोरेंसिक लॉग सत्यापित ★',
  '★ RESTRICTED DATA ACCESS ★': '★ प्रतिबंधित डेटा पहुंच ★',
  '★ SECURE DATA ENCRYPTION ★': '★ सुरक्षित डेटा एन्क्रिप्शन ★',
  '📥 Download PDF / Save File': '📥 पीडीएफ डाउनलोड करें / फ़ाइल सहेजें',
  'AUTHORIZED PERSONNEL ONLY': 'केवल अधिकृत कार्मिक',
  'Assigned Cases Management': 'आवंटित केस प्रबंधन',
  'Bright Mode (Civic Light)': 'ब्राइट मोड (नागरिक लाइट)',
  'CRIME SCENE EVIDENCE ZONE': 'अपराध स्थल साक्ष्य क्षेत्र',
  'Case Registration Heatmap': 'केस पंजीकरण हीटमैप',
  'Confidential Case Dossier': 'गोपनीय केस दस्तावेज़',
  'Digits only in DD/MM/YYYY': 'केवल दिन/माह/वर्ष में अंक',
  'Enter matching characters': 'समान वर्ण दर्ज करें',
  'Enter registered username': 'पंजीकृत यूज़रनेम दर्ज करें',
  'Enter strong new password': 'मजबूत नया पासवर्ड दर्ज करें',
  'Host Police Administrator': 'होस्ट पुलिस व्यवस्थापक',
  'How to Login Immediately:': 'तुरंत लॉगिन कैसे करें:',
  'Inter-Department Briefing': 'अंतर-विभागीय ब्रीफिंग',
  'Limited Access Authorized': 'सीमित पहुंच अधिकृत',
  'Marked as Fake / Rejected': 'फर्जी / अस्वीकृत चिह्नित',
  'No pending notifications.': 'कोई लंबित सूचनाएं नहीं हैं।',
  'Officer Review & Decision': 'अधिकारी समीक्षा और निर्णय',
  'Police Departmental Login': 'पुलिस विभागीय लॉगिन',
  'Similar Victim Name Match': 'समान पीड़ित नाम मिलान',
  'Toggle Bright / Dark Mode': 'ब्राइट / डार्क मोड बदलें',
  'Toggle Case Status Legend': 'केस स्थिति संकेत सूची टॉगल करें',
  'Toggle Dark / Bright Mode': 'डार्क / ब्राइट मोड बदलें',
  'Type Official Designation': 'आधिकारिक पदनाम टाइप करें',
  'Update Court Hearing Date': 'अदालत सुनवाई तिथि अपडेट करें',
  'Victim / Case Complainant': 'पीड़ित / केस शिकायतकर्ता',
  'with victim name matching': 'पीड़ित नाम से मेल खाते हुए',
  '🔒 Case Solved (Read-Only)': '🔒 केस हल हो चुका है (केवल पढ़ने योग्य)',
  'Account Role / Category:': 'खाता भूमिका / श्रेणी:',
  'Case Sequential Timeline': 'केस क्रमिक समयरेखा',
  'Complaint Filing Summary': 'शिकायत दर्ज करने का सारांश',
  'Crime Hotspot Risk Zones': 'अपराध संवेदनशील जोखिम क्षेत्र',
  'Iris Scan & Verification': 'आईरिस स्कैन एवं सत्यापन',
  'Monthly Crime Statistics': 'मासिक अपराध आंकड़े',
  'No Police Officers Found': 'कोई पुलिस अधिकारी नहीं मिला',
  'Open Document in New Tab': 'दस्तावेज़ नए टैब में खोलें',
  'POLICE LINE DO NOT CROSS': 'पुलिस लाइन पार न करें',
  'Photo Title / File Name:': 'फोटो शीर्षक / फ़ाइल का नाम:',
  'Relevance / Description:': 'प्रासंगिकता / विवरण:',
  'Suspect Criminal Profile': 'संदिग्ध आपराधिक प्रोफ़ाइल',
  'Suspect(s) Interrogation': 'संदिग्ध(ओं) से पूछताछ',
  'Upload Timestamp & Size:': 'अपलोड समय एवं आकार:',
  '★ LAW ENFORCEMENT ONLY ★': '★ केवल कानून प्रवर्तन ★',
  '2. Officer Registration': '2. अधिकारी पंजीकरण',
  'Approved (Direct Login)': 'स्वीकृत (सीधा लॉगिन)',
  'Assigned Field Officers': 'आवंटित फील्ड अधिकारी',
  'Assigned Host Inspector': 'आवंटित होस्ट इंस्पेक्टर',
  'Badge / Bar License ID:': 'बैज / बार लाइसेंस आईडी:',
  'Case Location / Venue *': 'केस का स्थान / स्थल *',
  'Case Title / FIR Name *': 'केस शीर्षक / एफआईआर नाम *',
  'Click or type to filter': 'फ़िल्टर करने हेतु क्लिक करें या टाइप करें',
  'Credential Requirement:': 'क्रेडेंशियल आवश्यकता:',
  'Crime Category & Status': 'अपराध श्रेणी एवं स्थिति',
  'Crime Scene Examination': 'अपराध स्थल की जांच',
  'Date of Birth & Gender:': 'जन्म तिथि एवं लिंग:',
  'Delete All Team Members': 'सभी टीम सदस्यों को हटाएं',
  'Description of Incident': 'घटना का विवरण',
  'Document / File Title *': 'दस्तावेज़ / फ़ाइल का शीर्षक *',
  'ENTER CAPTCHA CODE HERE': 'यहाँ कैप्चा कोड दर्ज करें',
  'Immediate Direct Login:': 'त्वरित सीधा लॉगिन:',
  'Initial FIR step locked': 'प्रारंभिक एफआईआर चरण लॉक है',
  'No Matching Cases Found': 'कोई मेल खाता मामला नहीं मिला',
  'Open Citizen Complaints': 'नागरिक शिकायतें खोलें',
  'Passwords do not match!': 'पासवर्ड मेल नहीं खाते!',
  'Print APB Dispatch Slip': 'एपीबी प्रेषण पर्ची प्रिंट करें',
  'Secure Evidence Logged:': 'सुरक्षित साक्ष्य दर्ज:',
  'Select Target Suspect *': 'लक्षित संदिग्ध चुनें *',
  'Transmitted APB History': 'प्रसारित एपीबी इतिहास',
  'Witness Name (Optional)': 'गवाह का नाम (वैकल्पिक)',
  '★ CRIME MATRIX SYSTEM ★': '★ क्राइम मैट्रिक्स प्रणाली ★',
  '📍 Request Reference ID:': '📍 अनुरोध संदर्भ आईडी:',
  '1. Victim Registration': '1. पीड़ित पंजीकरण',
  'Administrative Officer': 'प्रशासनिक अधिकारी',
  'Arms / Weapon Supplier': 'हथियार / असलहा आपूर्तिकर्ता',
  'Badge / Service Number': 'बैज / सेवा संख्या',
  'CCTV / Video Recording': 'सीसीटीवी / वीडियो रिकॉर्डिंग',
  'Case Evidence Exhibits': 'केस साक्ष्य प्रदर्श',
  'Click zone for details': 'विवरण हेतु क्षेत्र पर क्लिक करें',
  'Crime Scene Inspection': 'अपराध स्थल का निरीक्षण',
  'Cross-Border Narcotics': 'सीमा पार मादक पदार्थ',
  'Custom Relationship...': 'कस्टम संबंध...',
  'Enter current password': 'वर्तमान पासवर्ड दर्ज करें',
  'FORENSIC LOGS VERIFIED': 'फोरेंसिक लॉग सत्यापित',
  'Final Review Completed': 'अंतिम समीक्षा पूर्ण',
  'IP & Digital Forensics': 'आईपी एवं डिजिटल फोरेंसिक',
  'Investigation Progress': 'जांच प्रगति',
  'Investigator / Person:': 'जांचकर्ता / व्यक्ति:',
  'Key Witness (Optional)': 'प्रमुख गवाह (वैकल्पिक)',
  'LAW ENFORCEMENT PORTAL': 'कानून प्रवर्तन पोर्टल',
  'Metro Central Precinct': 'मेट्रो सेंट्रल थाना क्षेत्र',
  'Narcotics Distribution': 'मादक पदार्थ तस्करी',
  'No Query Performed Yet': 'अभी तक कोई क्वेरी नहीं की गई',
  'Official Designation *': 'आधिकारिक पदनाम *',
  'PHOTO RECORD EXCLUSION': 'फोटो रिकॉर्ड विवरण',
  'RESTRICTED DATA ACCESS': 'प्रतिबंधित डेटा पहुंच',
  'Remove Node Connection': 'नोड कनेक्शन हटाएं',
  'SCADA Attack Analysis:': 'स्काडा (SCADA) हमला विश्लेषण:',
  'SECURE DATA ENCRYPTION': 'सुरक्षित डेटा एन्क्रिप्शन',
  'Set Court Hearing Date': 'अदालत सुनवाई तिथि तय करें',
  'Settings & Preferences': 'सेटिंग्स एवं प्राथमिकताएं',
  'Target Role Requested:': 'अनुरोधित पद / भूमिका:',
  'Timestamp & File Size:': 'समय एवं फ़ाइल आकार:',
  'View Full Case Dossier': 'पूर्ण केस दस्तावेज़ देखें',
  'and your set password.': 'और आपका निर्धारित पासवर्ड।',
  'e.g. 10:30 PM or 22:30': 'उदा. 10:30 अपराह्न या 22:30',
  'Active Investigations': 'सक्रिय जांच',
  'Arrest Warrant Issued': 'गिरफ्तारी वारंट जारी',
  'Assign Host Inspector': 'होस्ट इंस्पेक्टर नियुक्त करें',
  'Binary Tree Hierarchy': 'बाइनरी ट्री पदानुक्रम',
  'Biometrics & Security': 'बायोमेट्रिक्स एवं सुरक्षा',
  'Close Navigation Menu': 'नेविगेशन मेनू बंद करें',
  'Complainant Full Name': 'शिकायतकर्ता का पूरा नाम',
  'Create & Link Suspect': 'संदिग्ध बनाएं एवं लिंक करें',
  'Current Assigned Host': 'वर्तमान आवंटित होस्ट',
  'Edit Evidence / Notes': 'साक्ष्य / नोट्स संपादित करें',
  'Extortion & Blackmail': 'जबरन वसूली एवं ब्लैकमेल',
  'Instant Approval Mode': 'त्वरित स्वीकृति मोड',
  'Investigation Details': 'जांच विवरण',
  'Mark as Fake / Reject': 'फर्जी चिह्नित करें / अस्वीकार करें',
  'No Active Case Linked': 'कोई सक्रिय केस जुड़ा नहीं है',
  'Official Designation:': 'आधिकारिक पदनाम:',
  'Police Inspector (PI)': 'पुलिस इंस्पेक्टर (PI)',
  'Police Officer PORTAL': 'पुलिस अधिकारी पोर्टल',
  'Re-enter new password': 'नया पासवर्ड पुनः दर्ज करें',
  'Relationship / Role *': 'संबंध / भूमिका *',
  'Remove photo/document': 'फोटो/दस्तावेज़ हटाएं',
  'Residential Address *': 'आवासीय पता *',
  'Review Document Image': 'दस्तावेज़ छवि की समीक्षा करें',
  'Select Enrolment Type': 'नामांकन प्रकार चुनें',
  'Subscriber Full Name:': 'उपभोक्ता का पूरा नाम:',
  'Suspect(s) Identified': 'संदिग्ध(ओं) की पहचान',
  'Verify & Register FIR': 'सत्यापित करें और एफआईआर दर्ज करें',
  'Women Safety Helpline': 'महिला सुरक्षा हेल्पलाइन',
  '+ Create New Suspect': '+ नया संदिग्ध बनाएं',
  '-- Choose Suspect --': '-- संदिग्ध चुनें --',
  'Accomplice / Getaway': 'सहयोगी / भगाने वाला',
  'Approving Authority:': 'स्वीकृति प्राधिकारी:',
  'Assigned Police Host': 'आवंटित पुलिस होस्ट',
  'Assigned Police Team': 'आवंटित पुलिस टीम',
  'BACK TO LOGIN PORTAL': 'लॉगिन पोर्टल पर वापस जाएं',
  'Citizen e-FIR Portal': 'नागरिक ई-एफआईआर पोर्टल',
  'Disconnect Node Link': 'नोड लिंक डिस्कनेक्ट करें',
  'Edit suspect details': 'संदिग्ध विवरण संपादित करें',
  'Filter Awaiting Host': 'होस्ट प्रतीक्षारत फ़िल्टर करें',
  'Flash APB (Critical)': 'फ्लैश एपीबी (अति-गंभीर)',
  'General Intelligence': 'सामान्य खुफिया जानकारी',
  'Generate New CAPTCHA': 'नया कैप्चा बनाएं',
  'Incident Date & Time': 'घटना की तारीख एवं समय',
  'Investigative Notes:': 'जांच नोट्स:',
  'LAW ENFORCEMENT ONLY': 'केवल कानून प्रवर्तन',
  'Manage case suspects': 'केस संदिग्धों का प्रबंधन करें',
  'Monthly Crime Trends': 'मासिक अपराध प्रवृत्तियां',
  'No Court Hearing Set': 'कोई अदालत सुनवाई तय नहीं',
  'Notes & Instructions': 'नोट्स एवं निर्देश',
  'Notes & Observations': 'टिप्पणियां एवं अवलोकन',
  'Notes / Description:': 'टिप्पणी / विवरण:',
  'Official Police Desk': 'आधिकारिक पुलिस डेस्क',
  'Open Case Management': 'केस प्रबंधन खोलें',
  'Open Navigation Menu': 'नेविगेशन मेनू खोलें',
  'Pending Verification': 'सत्यापन लंबित',
  'Personal Information': 'व्यक्तिगत जानकारी',
  'Residential Address:': 'आवासीय पता:',
  'Routine Coordination': 'सामान्य समन्वय',
  'Save Profile Changes': 'प्रोफ़ाइल परिवर्तन सहेजें',
  'Save System Settings': 'प्रणाली सेटिंग्स सहेजें',
  'Select Target Role *': 'लक्षित भूमिका चुनें *',
  'Supporting Documents': 'सहायक दस्तावेज',
  'Suspect Apprehension': 'संदिग्ध की धरपकड़',
  'Uploaded By Officer:': 'अपलोडकर्ता अधिकारी:',
  'Victim / Complainant': 'पीड़ित / शिकायतकर्ता',
  'immediately Approved': 'तुरंत स्वीकृत',
  '(If any / Optional)': '(यदि कोई हो / वैकल्पिक)',
  'Add / Edit Suspects': 'संदिग्ध जोड़ें / संपादित करें',
  'Add Node Connection': 'नोड कनेक्शन जोड़ें',
  'All Points Bulletin': 'ऑल पॉइंट्स बुलेटिन',
  'Ambulance / Medical': 'एंबुलेंस / चिकित्सा',
  'Anti-Narcotics Cell': 'मादक पदार्थ निरोधक शाखा',
  'Binary Tree Network': 'बाइनरी ट्री नेटवर्क',
  'Biometric Iris Hash': 'बायोमेट्रिक आईरिस हैश',
  'Biometric Iris Scan': 'बायोमेट्रिक आईरिस स्कैन',
  'Brief Description *': 'संक्षिप्त विवरण *',
  'CRIME MATRIX SYSTEM': 'क्राइम मैट्रिक्स प्रणाली',
  'Close Profile Modal': 'प्रोफ़ाइल मोडल बंद करें',
  'Close Progress View': 'प्रगति दृश्य बंद करें',
  'Complainant Address': 'शिकायतकर्ता का पता',
  'Complainant Details': 'शिकायतकर्ता विवरण',
  'Crime / Allegations': 'अपराध / आरोप',
  'Crime Matrix Portal': 'क्राइम मैट्रिक्स पोर्टल',
  'Crime Network Graph': 'अपराध नेटवर्क ग्राफ',
  'Currently Assigned:': 'वर्तमान में आवंटित:',
  'Cyber Crime Officer': 'साइबर अपराध अधिकारी',
  'Date of Assigning *': 'आवंटन की तारीख *',
  'Department / Firm *': 'विभाग / फर्म *',
  'ENCRYPTION: AES-256': 'एन्क्रिप्शन: AES-256',
  'Edit timeline entry': 'समयरेखा प्रविष्टि संपादित करें',
  'Estimated Geofence:': 'अनुमानित जियोफेंस:',
  'Evidence Repository': 'साक्ष्य रिपॉजिटरी',
  'FASTag Transit Hit:': 'फास्टैग पारगमन हिट:',
  'File / Record Title': 'फ़ाइल / रिकॉर्ड शीर्षक',
  'Forensic Department': 'फोरेंसिक विभाग',
  'Host (Station Head)': 'होस्ट (थाना प्रमुख)',
  'Informant / Spotter': 'मुखबिर / स्पॉट्टर',
  'Last Known Location': 'अंतिम ज्ञात स्थान',
  'Limited Case Access': 'सीमित केस पहुंच',
  'Login & Verify Iris': 'लॉगिन एवं आईरिस सत्यापन',
  'Master Cases Ledger': 'मास्टर केस बहीखाता',
  'Never (HQ Terminal)': 'कभी नहीं (मुख्यालय टर्मिनल)',
  'New Suspect Profile': 'नया संदिग्ध प्रोफ़ाइल',
  'Personnel Iris Scan': 'कार्मिक आईरिस स्कैन',
  'Photo Name / Title:': 'फोटो नाम / शीर्षक:',
  'Police Control Room': 'पुलिस नियंत्रण कक्ष',
  'Police Station Name': 'पुलिस स्टेशन का नाम',
  'Quick Demo Accounts': 'त्वरित डेमो खाते',
  'Registration Portal': 'पंजीकरण पोर्टल',
  'Save Court Schedule': 'अदालत अनुसूची सहेजें',
  'Select Account Role': 'खाता पद चुनें',
  'Select Photo Avatar': 'फोटो अवतार चुनें',
  'Small Description *': 'संक्षिप्त विवरण *',
  'Submit Registration': 'पंजीकरण सबमिट करें',
  'Suspect Full Name *': 'संदिग्ध का पूरा नाम *',
  'Under Investigation': 'जांच जारी',
  'Upload New Evidence': 'नया साक्ष्य अपलोड करें',
  'Vehicle Information': 'वाहन की जानकारी',
  'Verification Proof:': 'सत्यापन प्रमाण:',
  'Years of Experience': 'अनुभव के वर्ष',
  'e.g. Rajesh Khurana': 'उदा. राजेश खुराना',
  'e.g. officer_ramesh': 'उदा. officer_ramesh',
  '15+ Years (Senior)': '15+ वर्ष (वरिष्ठ)',
  'APB Alert Category': 'एपीबी अलर्ट श्रेणी',
  'Action In Progress': 'कार्रवाई जारी',
  'Address (if known)': 'पता (यदि ज्ञात हो)',
  'All Precinct Cases': 'सभी थाना क्षेत्र के मामले',
  'Alternate Contact:': 'वैकल्पिक संपर्क:',
  'Call Centers & CDR': 'कॉल सेंटर एवं सीडीआर',
  'Citizen Complaints': 'नागरिक शिकायतें',
  'Close Case Details': 'केस विवरण बंद करें',
  'Close Registration': 'पंजीकरण बंद करें',
  'Confirm Password *': 'पासवर्ड की पुष्टि करें *',
  'Court Hearing Date': 'अदालत सुनवाई की तारीख',
  'Crime / Allegation': 'अपराध / आरोप',
  'Crime Distribution': 'अपराध वितरण',
  'Dashboard Overview': 'डैशबोर्ड अवलोकन',
  'Department / Firm:': 'विभाग / फर्म:',
  'Evidence thumbnail': 'साक्ष्य थंबनेल',
  'File / Record Name': 'फ़ाइल / रिकॉर्ड नाम',
  'Gang Leader / Boss': 'गिरोह का सरगना / बॉस',
  'Host Administrator': 'होस्ट व्यवस्थापक',
  'Image / Photograph': 'छवि / तस्वीर',
  'Iris Scan Required': 'आईरिस स्कैन आवश्यक',
  'Issuing Department': 'जारीकर्ता विभाग',
  'Language selection': 'भाषा चयन',
  'National Emergency': 'राष्ट्रीय आपातकाल',
  'Next Court Hearing': 'अगली अदालत की सुनवाई',
  'Pending Complaints': 'लंबित शिकायतें',
  'Register Complaint': 'शिकायत दर्ज करें',
  'Request and Access': 'अनुरोध एवं पहुंच',
  'Requisition Domain': 'मांग क्षेत्र',
  'Role / Designation': 'भूमिका / पदनाम',
  'Save Case Suspects': 'केस संदिग्धों को सहेजें',
  'Save Suspect Edits': 'संदिग्ध संपादन सहेजें',
  'Select Portal Role': 'पोर्टल पद चुनें',
  'Size & Upload Time': 'आकार एवं अपलोड समय',
  'Submit Requisition': 'मांग-पत्र सबमिट करें',
  'Subscriber Details': 'उपभोक्ता विवरण',
  'Suspect Management': 'संदिग्ध प्रबंधन',
  'Toggle Camera View': 'कैमरा दृश्य बदलें',
  'Toggle states list': 'राज्यों की सूची टॉगल करें',
  'Transmit Flash APB': 'फ्लैश एपीबी प्रसारित करें',
  'Unsolved (Pending)': 'अनसुलझे (लंबित)',
  'yourname@gmail.com': 'yourname@gmail.com',
  'Add Schedule Task': 'कार्यसूची कार्य जोड़ें',
  'Assigned Officers': 'आवंटित अधिकारी',
  'Back to Dashboard': 'डैशबोर्ड पर वापस जाएं',
  'Basic Information': 'बुनियादी जानकारी',
  'Case Reference ID': 'केस संदर्भ आईडी',
  'Choose Username *': 'यूज़रनेम चुनें *',
  'Citizen Enrolment': 'नागरिक नामांकन',
  'Complainant Email': 'शिकायतकर्ता का ईमेल',
  'Complainant Phone': 'शिकायतकर्ता का फ़ोन',
  'Credentials Setup': 'क्रेडेंशियल सेटअप',
  'Crime Committed *': 'किया गया अपराध *',
  'Crime Hotspot Map': 'अपराध संवेदनशील क्षेत्र मानचित्र',
  'Critical Priority': 'अति-गंभीर प्राथमिकता',
  'Document / Report': 'दस्तावेज़ / रिपोर्ट',
  'Enter 6-digit OTP': '6 अंकों का ओटीपी दर्ज करें',
  'Experience Level:': 'अनुभव स्तर:',
  'Fingerprint Match': 'फिंगरप्रिंट मिलान',
  'Forensic Analysis': 'फोरेंसिक विश्लेषण',
  'Homicide / Murder': 'हत्या / कत्ल',
  'Human Trafficking': 'मानव तस्करी',
  'Incident Location': 'घटना का स्थान',
  'Main Police Admin': 'मुख्य पुलिस व्यवस्थापक',
  'Mobile Verified ✓': 'मोबाइल सत्यापित ✓',
  'Network Operator:': 'नेटवर्क ऑपरेटर:',
  'No Cases Allotted': 'कोई मामला आवंटित नहीं है',
  'Notes / Comments:': 'टिप्पणियां / नोट्स:',
  'Officer Dashboard': 'पुलिस अधिकारी डैशबोर्ड',
  'Precision Radius:': 'सटीकता दायरा:',
  'Receiving Station': 'प्राप्तकर्ता थाना',
  'Registered Owner:': 'पंजीकृत स्वामी:',
  'Rh Factor (+ / -)': 'Rh फैक्टर (+ / -)',
  'Search Suspect...': 'संदिग्ध खोजें...',
  'Select Department': 'विभाग चुनें',
  'Select role above': 'ऊपर पद चुनें',
  'Switch to English': 'अंग्रेज़ी में बदलें',
  'Toggle Fullscreen': 'फ़ुलस्क्रीन टॉगल करें',
  'View Full Profile': 'पूर्ण प्रोफ़ाइल देखें',
  'Women Safety Cell': 'महिला सुरक्षा प्रकोष्ठ',
  'e.g. CR-2026-8942': 'उदा. CR-2026-8942',
  '👮 Police Officers': '👮 पुलिस अधिकारी',
  'Activation Date:': 'सक्रियण तिथि:',
  'Additional Notes': 'अतिरिक्त नोट्स',
  'Alleged Offense:': 'कथित अपराध:',
  'Billing Address:': 'बिलिंग पता:',
  'Broadcast Ledger': 'प्रसारण बहीखाता (लेजर)',
  'Burglary & Theft': 'सेंधमारी एवं चोरी',
  'Case Complainant': 'केस शिकायतकर्ता',
  'Case Status Pins': 'केस स्थिति पिन',
  'Completed Duties': 'पूर्ण कर्तव्य / ड्यूटी',
  'Confirm Deletion': 'हटाने की पुष्टि करें',
  'Cyber Crime Cell': 'साइबर अपराध प्रकोष्ठ',
  'File Attachment:': 'फ़ाइल संलग्नक:',
  'Hawala Financier': 'हवाला फाइनेंसर',
  'Hearing Location': 'सुनवाई का स्थान',
  'ISP & AS Number:': 'आईएसपी एवं एएस नंबर:',
  'Incident Details': 'घटना का विवरण',
  'Inter-State Gang': 'अंतर-राज्यीय गिरोह',
  'Legal Department': 'कानूनी विभाग',
  'Location / Venue': 'स्थान / स्थल',
  'Location Tracing': 'स्थान ट्रेसिंग',
  'Overall Progress': 'कुल प्रगति',
  'Pending Approval': 'स्वीकृति लंबित',
  'Police Constable': 'पुलिस कांस्टेबल',
  'Recorded Victim:': 'दर्ज पीड़ित:',
  'Registered Cases': 'दर्ज मामले',
  'Reset Map Center': 'मानचित्र केंद्र रीसेट करें',
  'SUBMIT COMPLAINT': 'शिकायत सबमिट करें',
  'Selected preview': 'चयनित पूर्वावलोकन',
  'Size & Timestamp': 'आकार एवं समय',
  'Submission Time:': 'प्रस्तुति समय:',
  'Total Week Tasks': 'सप्ताह के कुल कार्य',
  'Vehicle Tracking': 'वाहन ट्रैकिंग',
  '+ Assign Victim': '+ पीड़ित नियुक्त करें',
  'Access Password': 'पहुंच पासवर्ड',
  'Action Required': 'कार्रवाई आवश्यक',
  'Active Cell ID:': 'सक्रिय सेल आईडी:',
  'Add New Suspect': 'नया संदिग्ध जोड़ें',
  'Advocate PORTAL': 'अधिवक्ता पोर्टल',
  'Alerts and APBs': 'अलर्ट और एपीबी',
  'Alleged Offense': 'कथित अपराध',
  'Applicant Name:': 'आवेदक का नाम:',
  'Assign Officers': 'अधिकारी नियुक्त करें',
  'Audio / Wiretap': 'ऑडियो / वायरटैप',
  'Case Management': 'केस प्रबंधन',
  'Create New Case': 'नया केस बनाएं',
  'Crime Category:': 'अपराध श्रेणी:',
  'Criminal Record': 'आपराधिक रिकॉर्ड',
  'Delete / Remove': 'हटाएं / निकालें',
  'Delete Evidence': 'साक्ष्य हटाएं',
  'Download / View': 'डाउनलोड / देखें',
  'Drag to reorder': 'पुनः क्रमबद्ध करने हेतु खींचें',
  'Evidence Review': 'साक्ष्य समीक्षा',
  'Field Inspector': 'फील्ड इंस्पेक्टर',
  'Field Operation': 'फील्ड ऑपरेशन',
  'Forensic Expert': 'फोरेंसिक विशेषज्ञ',
  'Issuing Officer': 'जारीकर्ता अधिकारी',
  'LIVE TOWER LOCK': 'लाइव टावर लॉक',
  'No Alerts Found': 'कोई अलर्ट नहीं मिला',
  'Officer Remarks': 'अधिकारी की टिप्पणी',
  'Officer Section': 'अधिकारी अनुभाग',
  'Remove / Unlink': 'हटाएं / अनलिंक करें',
  'Remove document': 'दस्तावेज़ हटाएं',
  'Review & Action': 'समीक्षा और कार्रवाई',
  'Review & Remark': 'समीक्षा एवं टिप्पणी',
  'Suspect Dossier': 'संदिग्ध दस्तावेज़',
  'Suspect Profile': 'संदिग्ध प्रोफ़ाइल',
  'Suspect preview': 'संदिग्ध पूर्वावलोकन',
  'Switch Language': 'भाषा बदलें',
  'Total Incidents': 'कुल घटनाएं',
  'Update Password': 'पासवर्ड अपडेट करें',
  'Upload Evidence': 'साक्ष्य अपलोड करें',
  'Gap Detector': 'गैप डिटेक्टर',
  'Wanted Suspects': 'वांछित संदिग्ध',
  'e.g. 9876543210': 'उदा. 9876543210',
  '✓ VERIFIED SCAN': '✓ सत्यापित स्कैन',
  '(Letters only)': '(केवल अक्षर)',
  '+ Add Advocate': '+ अधिवक्ता जोड़ें',
  'ACTIVE SESSION': 'सक्रिय सत्र',
  'Administration': 'प्रशासन',
  'All Complaints': 'सभी शिकायतें',
  'Allotted Cases': 'आवंटित मामले',
  'Assigned Cases': 'आवंटित मामले',
  'Assigned Role:': 'आवंटित भूमिका:',
  'CDR / Dial 112': 'सीडीआर / डायल 112',
  'Case Reference': 'केस संदर्भ',
  'Case Time-line': 'केस समयरेखा',
  'Co-conspirator': 'सह-षड्यंत्रकारी',
  'Collapse Panel': 'पैनल संक्षिप्त करें',
  'Confirm Delete': 'हटाने की पुष्टि करें',
  'Court Location': 'अदालत का स्थान',
  'Current Status': 'वर्तमान स्थिति',
  'Email Address:': 'ईमेल पता:',
  'Evidence Files': 'साक्ष्य फ़ाइलें',
  'Head Constable': 'हेड कांस्टेबल',
  'IMEI Hardware:': 'आईएमईआई हार्डवेयर:',
  'Incident Date:': 'घटना की तारीख:',
  'Last GIS Sync:': 'अंतिम जीआईएस समन्वय:',
  'Missing Person': 'लापता व्यक्ति',
  'Move step down': 'चरण नीचे ले जाएं',
  'Pending Duties': 'लंबित कर्तव्य / ड्यूटी',
  'Police Officer': 'पुलिस अधिकारी',
  'Primary Crime:': 'प्राथमिक अपराध:',
  'Priority Level': 'प्राथमिकता स्तर',
  'RTO Authority:': 'आरटीओ प्राधिकरण:',
  'Search here...': 'यहाँ खोजें...',
  'Set Password *': 'पासवर्ड तय करें *',
  'Target Suspect': 'लक्षित संदिग्ध',
  'Traffic Police': 'यातायात पुलिस',
  '✓ OTP Verified': '✓ ओटीपी सत्यापित',
  '+ Add Officer': '+ अधिकारी जोड़ें',
  'Age & Gender:': 'आयु एवं लिंग:',
  'Armed Robbery': 'सशस्त्र डकैती',
  'Assigned Host': 'आवंटित होस्ट',
  'Assigned Team': 'आवंटित टीम',
  'Awaiting Host': 'होस्ट प्रतीक्षारत',
  'Blood Group *': 'रक्त समूह *',
  'Case Overview': 'केस अवलोकन',
  'Case Timeline': 'केस समयरेखा',
  'Court Hearing': 'अदालत सुनवाई',
  'Crime Details': 'अपराध विवरण',
  'Date & Time *': 'तारीख एवं समय *',
  'Date Assigned': 'आवंटन तिथि',
  'Date of Birth': 'जन्म तिथि',
  'Edit Evidence': 'साक्ष्य संपादित करें',
  'Event Title *': 'घटना का शीर्षक *',
  'File Category': 'फ़ाइल श्रेणी',
  'Handover Log:': 'हैंडओवर लॉग:',
  'Hide Password': 'पासवर्ड छुपाएं',
  'ISP / CERT-In': 'आईएसपी / सर्ट-इन',
  'Incident Date': 'घटना की तारीख',
  'Incident Time': 'घटना का समय',
  'Interrogation': 'पूछताछ',
  'Iris Verified': 'आईरिस सत्यापित',
  'Known Aliases': 'ज्ञात उपनाम',
  'Last 12 weeks': 'पिछले 12 सप्ताह',
  'Last Updated:': 'अंतिम अपडेट:',
  'Legal Advisor': 'कानूनी सलाहकार',
  'Legal Counsel': 'कानूनी सलाहकार',
  'Legal Defense': 'कानूनी सलाहकार',
  'Make & Model:': 'मेक एवं मॉडल:',
  'Matched Cases': 'मेल खाने वाले मामले',
  'Min 2 letters': 'न्यूनतम 2 अक्षर',
  'No Photograph': 'कोई तस्वीर उपलब्ध नहीं',
  'Notifications': 'सूचनाएं',
  'OpenStreetMap': 'ओपनस्ट्रीटमैप',
  'PHOTO EXHIBIT': 'फोटो प्रदर्श (सबूत)',
  'Phone Number:': 'फ़ोन नंबर:',
  'Previous Step': 'पिछला कदम',
  'Print Dossier': 'दस्तावेज़ प्रिंट करें',
  'SYSTEM SECURE': 'प्रणाली सुरक्षित',
  'Show Password': 'पासवर्ड दिखाएं',
  'Target Entity': 'लक्षित इकाई',
  'Under Custody': 'हिरासत में',
  'Urgency Level': 'तात्कालिकता स्तर',
  'Vehicle Theft': 'वाहन चोरी',
  'Victim PORTAL': 'पीड़ित पोर्टल',
  'Victim\'s Case': 'पीड़ित का मामला',
  'View Suspects': 'संदिग्ध देखें',
  'e.g. INS-8812': 'उदा. INS-8812',
  '"Live Query"': '"लाइव क्वेरी"',
  '(DD/MM/YYYY)': '(दिन/माह/वर्ष)',
  'Access Tier:': 'पहुंच स्तर:',
  'Acknowledged': 'स्वीकृत',
  'Active Cases': 'सक्रिय मामले',
  'All Reviewed': 'सभी समीक्षित',
  'Bank Robbery': 'बैंक डकैती',
  'Blood Group:': 'रक्त समूह:',
  'CRIME MATRIX': 'क्राइम मैट्रिक्स',
  'Case Heatmap': 'केस हीटमैप',
  'Close Legend': 'संकेत विवरण बंद करें',
  'Close Pop-up': 'पॉप-अप बंद करें',
  'Closed Cases': 'हल किए गए मामले',
  'Complainant:': 'शिकायतकर्ता:',
  'Complainants': 'शिकायतकर्ता',
  'Crime Branch': 'अपराध शाखा (क्राइम ब्रांच)',
  'Crime Matrix': 'क्राइम मैट्रिक्स',
  'Crime Type *': 'अपराध का प्रकार *',
  'Cyber Attack': 'साइबर हमला',
  'Designation:': 'पदनाम:',
  'Direct Login': 'सीधा लॉगिन',
  'Download PDF': 'पीडीएफ डाउनलोड करें',
  'Hearing Date': 'सुनवाई तिथि',
  'High Urgency': 'उच्च तात्कालिकता',
  'Host Section': 'होस्ट अनुभाग',
  'Instant Code': 'त्वरित कोड',
  'Interrogated': 'पूछताछ की गई',
  'KYC VERIFIED': 'केवाईसी सत्यापित',
  'Main Offense': 'मुख्य अपराध',
  'Manage Cases': 'मामलों का प्रबंधन करें',
  'Move step up': 'चरण ऊपर ले जाएं',
  'Phone Number': 'फ़ोन नंबर',
  'Progress Bar': 'प्रगति पट्टी',
  'Quick Action': 'त्वरित कार्रवाई',
  'Reference No': 'संदर्भ संख्या',
  'Registration': 'पंजीकरण',
  'Relationship': 'संबंध',
  'Remove Photo': 'फोटो हटाएं',
  'Reset Center': 'केंद्र रीसेट करें',
  'Reverse DNS:': 'रिवर्स डीएनएस:',
  'Save Changes': 'परिवर्तन सहेजें',
  'Solved Cases': 'हल किए गए मामले',
  'Tree Network': 'ट्री नेटवर्क',
  'Under Arrest': 'गिरफ्तारी में',
  'Uploaded By:': 'अपलोडकर्ता:',
  'View Details': 'विवरण देखें',
  'View Network': 'नेटवर्क देखें',
  'Welcome back': 'वापसी पर स्वागत है',
  'Witness Name': 'गवाह का नाम',
  'not required': 'आवश्यक नहीं है',
  '⚖️ Advocates': '⚖️ अधिवक्ता',
  '1 - 3 Years': '1 - 3 वर्ष',
  'Active APBs': 'सक्रिय एपीबी',
  'Add Feature': 'सुविधा / चरण जोड़ें',
  'BRIGHT MODE': 'ब्राइट मोड',
  'Badge / ID:': 'बैज / आईडी:',
  'Bail Status': 'जमानत स्थिति',
  'Binary Tree': 'बाइनरी ट्री',
  'Call Ratio:': 'कॉल अनुपात:',
  'Case Name *': 'केस का नाम *',
  'Case Solved': 'केस हल हुआ',
  'Center Tree': 'ट्री को केंद्र में लाएं',
  'Chassis No:': 'चेसिस नं.:',
  'Clear state': 'राज्य साफ़ करें',
  'Cyber Crime': 'साइबर अपराध',
  'Day of Week': 'सप्ताह का दिन',
  'Delete Host': 'होस्ट हटाएं',
  'Delete task': 'कार्य हटाएं',
  'Description': 'विवरण',
  'Designation': 'पदनाम',
  'Full Name *': 'पूरा नाम *',
  'Host PORTAL': 'होस्ट पोर्टल',
  'Inter-State': 'अंतर-राज्यीय',
  'Law & Order': 'कानून एवं व्यवस्था',
  'Legal Basis': 'कानूनी आधार',
  'New Suspect': 'नया संदिग्ध',
  'Open Ports:': 'ओपन पोर्ट्स:',
  'Remove file': 'फ़ाइल हटाएं',
  'Remove step': 'चरण हटाएं',
  'Rescan Iris': 'आईरिस पुनः स्कैन करें',
  'Review Info': 'समीक्षा करें',
  'Select Type': 'प्रकार चुनें',
  'Total Cases': 'कुल मामले',
  'Tower / LBS': 'टावर / एलबीएस',
  'Transmitted': 'प्रसारित',
  'Uploaded At': 'अपलोड समय',
  'Uploaded By': 'अपलोडकर्ता',
  'Victim Name': 'पीड़ित का नाम',
  'e.g. Ramesh': 'उदा. रमेश',
  'e.g. Sharma': 'उदा. शर्मा',
  'e.g. Vikram': 'उदा. विक्रम',
  '(If known)': '(यदि ज्ञात हो)',
  '15 Minutes': '15 मिनट',
  '30 Minutes': '30 मिनट',
  'Absconding': 'फरार',
  'Action Req': 'कार्रवाई आवश्यक',
  'All States': 'सभी राज्य',
  'Case Title': 'केस का शीर्षक',
  'Close Case': 'केस बंद करें',
  'Close Page': 'पेज बंद करें',
  'Court Date': 'अदालत की तारीख',
  'Crime Type': 'अपराध का प्रकार',
  'DSP PORTAL': 'डीएसपी पोर्टल',
  'Department': 'विभाग',
  'Engine No:': 'इंजन नं.:',
  'Experience': 'अनुभव',
  'Full Name:': 'पूरा नाम:',
  'Kidnapping': 'अपहरण',
  'Milestones': 'मील के पत्थर',
  'REGISTERED': 'पंजीकृत',
  'Reset View': 'दृश्य रीसेट करें',
  'Risk Level': 'जोखिम स्तर',
  'Start Time': 'प्रारंभ समय',
  'Task Title': 'कार्य का शीर्षक',
  'Unassigned': 'अनावंटित',
  'View Photo': 'फोटो देखें',
  'e.g. Kumar': 'उदा. कुमार',
  '10+ Years': '10+ वर्ष',
  'Advocates': 'अधिवक्ता',
  'All Clear': 'सब ठीक है',
  'CAF / KYC': 'सीएएफ / केवाईसी',
  'Case Name': 'केस का नाम',
  'Category:': 'श्रेणी:',
  'Crime Map': 'अपराध मानचित्र',
  'DARK MODE': 'डार्क मोड',
  'Dept Head': 'विभागाध्यक्ष',
  'Encrypted': 'एन्क्रिप्टेड',
  'Extortion': 'जबरन वसूली',
  'File Name': 'फ़ाइल का नाम',
  'File Size': 'फ़ाइल आकार',
  'File Type': 'फ़ाइल का प्रकार',
  'Full Name': 'पूरा नाम',
  'Guardian:': 'अभिभावक:',
  'Location:': 'स्थान:',
  'Narcotics': 'मादक पदार्थ (ड्रग्स)',
  'Next Step': 'अगला कदम',
  'Priority:': 'प्राथमिकता:',
  'Selected:': 'चयनित:',
  'Sentenced': 'सजायाफ्ता',
  'September': 'सितंबर',
  'Suspects:': 'संदिग्ध:',
  'Thumbnail': 'थंबनेल',
  'Username:': 'यूज़रनेम:',
  'Vahan 4.0': 'वाहन 4.0',
  '✓ In Team': '✓ टीम में शामिल',
  '4+ cases': '4+ मामले',
  'Address:': 'पता:',
  'Advocate': 'अधिवक्ता',
  'Badge ID': 'बैज आईडी',
  'Burglary': 'सेंधमारी',
  'Category': 'श्रेणी',
  'Contact:': 'संपर्क:',
  'Critical': 'अति-गंभीर',
  'December': 'दिसंबर',
  'Document': 'दस्तावेज़',
  'Download': 'डाउनलोड करें',
  'End Time': 'समाप्ति समय',
  'Evidence': 'साक्ष्य',
  'February': 'फ़रवरी',
  'Forensic': 'फोरेंसिक',
  'Homicide': 'हत्या',
  'Language': 'भाषा',
  'Location': 'स्थान',
  'November': 'नवंबर',
  'Officers': 'अधिकारी',
  'Priority': 'प्राथमिकता',
  'Schedule': 'कार्यसूची (शेड्यूल)',
  'Selected': 'चयनित',
  'Settings': 'सेटिंग्स',
  'Suspects': 'संदिग्ध',
  'Timeline': 'समयरेखा',
  'Verified': 'सत्यापित',
  'Witness:': 'गवाह:',
  'Zoom Out': 'ज़ूम आउट करें',
  '0 cases': '0 मामले',
  '2 cases': '2 मामले',
  '3 cases': '3 मामले',
  '5 Years': '5 वर्ष',
  'Actions': 'कार्रवाइयां',
  'Address': 'पता',
  'Aliases': 'उपनाम',
  'Approve': 'स्वीकृत करें',
  'Assault': 'हमला',
  'Case ID': 'केस आईडी',
  'Cleared': 'दोषमुक्त',
  'Confirm': 'पुष्टि करें',
  'English': 'English',
  'January': 'जनवरी',
  'Missing': 'लापता',
  'Not Set': 'तय नहीं',
  'October': 'अक्टूबर',
  'On Bail': 'जमानत पर',
  'PENDING': 'लंबित',
  'Pending': 'लंबित',
  'Preview': 'पूर्वावलोकन',
  'Re-scan': 'पुनः स्कैन करें',
  'Refresh': 'ताज़ा करें',
  'Routine': 'सामान्य',
  'Status:': 'स्थिति:',
  'Urgency': 'तात्कालिकता',
  'Victim:': 'पीड़ित:',
  'Victims': 'पीड़ित',
  'Welcome': 'स्वागत है',
  'Zoom In': 'ज़ूम इन करें',
  '1 Hour': '1 घंटा',
  '1 case': '1 मामला',
  'Active': 'सक्रिय',
  'August': 'अगस्त',
  'Bailed': 'जमानत पर',
  'Cancel': 'रद्द करें',
  'Closed': 'बंद',
  'Crime:': 'अपराध:',
  'Delete': 'हटाएं',
  'Export': 'निर्यात',
  'Female': 'महिला',
  'Filter': 'फ़िल्टर',
  'Gender': 'लिंग',
  'Logout': 'लॉगआउट',
  'Medium': 'मध्यम',
  'Murder': 'हत्या / कत्ल',
  'Normal': 'सामान्य',
  'Others': 'अन्य',
  'POLICE': 'पुलिस',
  'Ref ID': 'संदर्भ आईडी',
  'Reject': 'अस्वीकार करें',
  'Search': 'खोजें',
  'Select': 'चुनें',
  'Solved': 'हल किया गया',
  'Status': 'स्थिति',
  'Submit': 'सबमिट करें',
  'Upload': 'अपलोड करें',
  'Victim': 'पीड़ित',
  'हिन्दी': 'हिन्दी',
  'Age *': 'आयु *',
  'April': 'अप्रैल',
  'Arson': 'आगजनी',
  'Audio': 'ऑडियो',
  'Cases': 'मामले',
  'Clear': 'साफ़ करें',
  'Close': 'बंद करें',
  'Email': 'ईमेल',
  'Files': 'फ़ाइलें',
  'Fraud': 'धोखाधड़ी',
  'Hindi': 'हिन्दी',
  'Host:': 'होस्ट:',
  'Hours': 'घंटे',
  'Image': 'छवि',
  'March': 'मार्च',
  'Other': 'अन्य',
  'Phone': 'फ़ोन',
  'Print': 'प्रिंट करें',
  'Reset': 'रीसेट करें',
  'Theft': 'चोरी',
  'Video': 'वीडियो',
  'Back': 'वापस',
  'Case': 'केस',
  'Date': 'तारीख',
  'Days': 'दिन',
  'Edit': 'संपादित करें',
  'FAKE': 'फर्जी',
  'High': 'उच्च',
  'Host': 'इन्वेस्टिगेटर',
  'Investigator': 'इन्वेस्टिगेटर',
  'July': 'जुलाई',
  'June': 'जून',
  'Less': 'कम',
  'Male': 'पुरुष',
  'Mins': 'मिनट',
  'More': 'अधिक',
  'NEXT': 'आगे बढ़ें (अगला)',
  'Role': 'पद / भूमिका',
  'Save': 'सहेजें',
  'Secs': 'सेकंड',
  'Step': 'चरण',
  'Time': 'समय',
  'ALL': 'सभी',
  'Age': 'आयु',
  'All': 'सभी',
  'Apr': 'अप्रैल',
  'Aug': 'अगस्त',
  'DSP': 'एसएचओ/इंस्पेक्टर',
  'SHO/Inspector': 'एसएचओ/इंस्पेक्टर',
  'Dec': 'दिसंबर',
  'Feb': 'फ़रवरी',
  'Jan': 'जनवरी',
  'Jul': 'जुलाई',
  'Jun': 'जून',
  'Low': 'कम',
  'Mar': 'मार्च',
  'May': 'मई',
  'NOT': 'नहीं',
  'New': 'नए',
  'Nov': 'नवंबर',
  'Oct': 'अक्टूबर',
  'Sep': 'सितंबर',
  'Yes': 'हाँ',
  'No': 'नहीं',
  'of': 'का',
};

// Vocabulary mapping for word-level translation in dynamic strings (553 words)
const WORD_MAP: Record<string, string> = {
  'Administration': 'प्रशासन',
  'Administrative': 'प्रशासनिक',
  'Authentication': 'प्रमाणीकरण',
  'Identification': 'पहचान',
  'Investigations': 'जांच',
  'Superintendent': 'अधीक्षक',
  'Administrator': 'व्यवस्थापक',
  'Interrogation': 'पूछताछ',
  'Investigation': 'जांच',
  'Notifications': 'सूचनाएं',
  'Apprehension': 'धरपकड़',
  'Complainants': 'शिकायतकर्ता',
  'Confidential': 'गोपनीय',
  'Coordination': 'समन्वय',
  'Departmental': 'विभागीय',
  'Distribution': 'वितरण',
  'Headquarters': 'मुख्यालय',
  'Intelligence': 'खुफिया',
  'Jurisdiction': 'क्षेत्राधिकार',
  'Notification': 'सूचना',
  'Registration': 'पंजीकरण',
  'Successfully': 'सफलतापूर्वक',
  'Transparency': 'पारदर्शिता',
  'Unauthorized': 'अनधिकृत',
  'Verification': 'सत्यापन',
  'Allegations': 'आरोप',
  'Certificate': 'प्रमाणपत्र',
  'Chargesheet': 'चार्जशीट',
  'Complainant': 'शिकायतकर्ता',
  'Departments': 'विभाग',
  'Description': 'विवरण',
  'Designation': 'पदनाम',
  'Fingerprint': 'फिंगरप्रिंट',
  'Information': 'सूचना',
  'Inter-State': 'अंतर-राज्यीय',
  'Investigate': 'जांच करें',
  'AUTHORIZED': 'अधिकृत',
  'Absconding': 'फरार',
  'Accomplice': 'सह-अपराधी',
  'Activation': 'सक्रियण',
  'Additional': 'अतिरिक्त',
  'Allegation': 'आरोप',
  'Applicants': 'आवेदक',
  'Attachment': 'संलग्नक',
  'Authorized': 'अधिकृत',
  'Background': 'पृष्ठभूमि',
  'Biometrics': 'बायोमेट्रिक्स',
  'Categories': 'श्रेणियां',
  'Complaints': 'शिकायतें',
  'Department': 'विभाग',
  'Dispatched': 'प्रेषित',
  'Downloaded': 'डाउनलोड किया गया',
  'Encryption': 'एन्क्रिप्शन',
  'Experience': 'अनुभव',
  'Kidnapping': 'अपहरण',
  'Magistrate': 'मजिस्ट्रेट',
  'Management': 'प्रबंधन',
  'Milestones': 'मील के पत्थर',
  'Photograph': 'तस्वीर',
  'Registered': 'पंजीकृत',
  'Repository': 'रिपॉजिटरी',
  'Restricted': 'प्रतिबंधित',
  'Statistics': 'आंकड़े',
  'Successful': 'सफल',
  'Supervisor': 'पर्यवेक्षक',
  'Unassigned': 'अनावंटित',
  'Unverified': 'असत्यापित',
  'Advocates': 'अधिवक्ता',
  'Alternate': 'वैकल्पिक',
  'Ambulance': 'एंबुलेंस',
  'Analytics': 'विश्लेषण',
  'Applicant': 'आवेदक',
  'Approvals': 'स्वीकृतियां',
  'Approving': 'स्वीकृत किया जा रहा है',
  'Assigning': 'नियुक्ति जारी',
  'Automated': 'स्वचालित',
  'Biometric': 'बायोमेट्रिक',
  'Blackmail': 'ब्लैकमेल',
  'Broadcast': 'प्रसारण',
  'Bulletins': 'बुलेटिन',
  'Cancelled': 'रद्द',
  'Clearance': 'मंजूरी',
  'Complaint': 'शिकायत',
  'Completed': 'पूर्ण',
  'Confirmed': 'पुष्ट',
  'Connected': 'जुड़ा हुआ',
  'Constable': 'कांस्टेबल',
  'Convicted': 'दोषी',
  'Countdown': 'उलटी गिनती',
  'Dashboard': 'डैशबोर्ड',
  'Documents': 'दस्तावेज़',
  'Emergency': 'आपातकालीन',
  'Encrypted': 'एन्क्रिप्टेड',
  'Enrolment': 'नामांकन',
  'Extortion': 'जबरन वसूली',
  'Generated': 'उत्पन्न',
  'Incidents': 'घटनाएं',
  'Informant': 'मुखबिर',
  'Inspector': 'इंस्पेक्टर',
  'Milestone': 'मील का पत्थर',
  'Narcotics': 'मादक पदार्थ',
  'Personnel': 'कार्मिक',
  'Recovered': 'बरामद',
  'Reference': 'संदर्भ',
  'Scheduled': 'निर्धारित',
  'Submitted': 'सबमिट किया गया',
  'Witnesses': 'गवाह',
  'Yesterday': 'कल',
  'Advocate': 'अधिवक्ता',
  'Allotted': 'आवंटित',
  'Analysis': 'विश्लेषण',
  'Approval': 'स्वीकृति',
  'Approved': 'स्वीकृत',
  'Assigned': 'आवंटित',
  'Awaiting': 'प्रतीक्षारत',
  'Building': 'भवन',
  'Bulletin': 'बुलेटिन',
  'Burglary': 'सेंधमारी',
  'Calendar': 'कैलेंडर',
  'Category': 'श्रेणी',
  'Citizens': 'नागरिक',
  'Complete': 'पूर्ण',
  'Criminal': 'आपराधिक',
  'Critical': 'अति-गंभीर',
  'Deadline': 'समयसीमा',
  'Decision': 'निर्णय',
  'Director': 'निदेशक',
  'Dispatch': 'प्रेषण',
  'District': 'जिला',
  'Division': 'मंडल',
  'Document': 'दस्तावेज़',
  'Download': 'डाउनलोड',
  'Enrolled': 'नामांकित',
  'Evidence': 'साक्ष्य',
  'Exhibits': 'प्रदर्श',
  'Feedback': 'प्रतिक्रिया',
  'Filtered': 'फ़िल्टर किया गया',
  'Forensic': 'फोरेंसिक',
  'Generate': 'उत्पन्न करें',
  'Hearings': 'सुनवाई',
  'Homicide': 'हत्या',
  'Hospital': 'अस्पताल',
  'Identify': 'पहचानें',
  'Identity': 'पहचान',
  'Incident': 'घटना',
  'Judicial': 'न्यायिक',
  'Location': 'स्थान',
  'Matching': 'मेल खाता',
  'Messages': 'संदेश',
  'Metadata': 'मेटाडेटा',
  'National': 'राष्ट्रीय',
  'Offenses': 'अपराध',
  'Officers': 'अधिकारी',
  'Official': 'आधिकारिक',
  'Optional': 'वैकल्पिक',
  'Overview': 'अवलोकन',
  'Password': 'पासवर्ड',
  'Personal': 'व्यक्तिगत',
  'Precinct': 'थाना क्षेत्र',
  'Previous': 'पिछला',
  'Priority': 'प्राथमिकता',
  'Progress': 'प्रगति',
  'Protocol': 'प्रोटोकॉल',
  'Register': 'पंजीकृत करें',
  'Rejected': 'अस्वीकृत',
  'Requests': 'अनुरोध',
  'Required': 'आवश्यक',
  'Resolved': 'हल किया गया',
  'Response': 'प्रतिक्रिया',
  'Reviewed': 'समीक्षित',
  'Schedule': 'कार्यसूची',
  'Security': 'सुरक्षा',
  'Selected': 'चयनित',
  'Settings': 'सेटिंग्स',
  'Suspects': 'संदिग्ध',
  'Timeline': 'समयरेखा',
  'Tomorrow': 'कल',
  'Tracking': 'ट्रैकिंग',
  'Unsolved': 'अनसुलझा',
  'Uploaded': 'अपलोड किया गया',
  'Username': 'यूज़रनेम',
  'Validate': 'सत्यापित करें',
  'Verified': 'सत्यापित',
  'Aadhaar': 'आधार',
  'Account': 'खाता',
  'Actions': 'कार्रवाइयां',
  'Address': 'पता',
  'Alleged': 'कथित',
  'Approve': 'स्वीकृत करें',
  'Average': 'औसत',
  'Captcha': 'कैप्चा',
  'Caution': 'सावधानी',
  'Central': 'केंद्रीय',
  'Citizen': 'नागरिक',
  'Cleared': 'दोषमुक्त',
  'Command': 'कमान',
  'Confirm': 'पुष्टि करें',
  'Connect': 'जोड़ें',
  'Contact': 'संपर्क',
  'Contacts': 'संपर्क',
  'Control': 'नियंत्रण',
  'Counsel': 'सलाहकार',
  'Created': 'बनाया गया',
  'Custody': 'हिरासत',
  'Declare': 'घोषित करें',
  'Defense': 'बचाव पक्ष',
  'Deleted': 'हटाया गया',
  'Details': 'विवरण',
  'Digital': 'डिजिटल',
  'Dossier': 'दस्तावेज़',
  'Exhibit': 'प्रदर्श',
  'General': 'सामान्य',
  'Hearing': 'सुनवाई',
  'Heatmap': 'हीटमैप',
  'History': 'इतिहास',
  'Inspect': 'निरीक्षण करें',
  'Justice': 'न्याय',
  'License': 'लाइसेंस',
  'Limited': 'सीमित',
  'Logging': 'लॉगिंग',
  'Manager': 'प्रबंधक',
  'Matched': 'मेल खाया',
  'Matches': 'मेल',
  'Medical': 'चिकित्सा',
  'Members': 'सदस्य',
  'Message': 'संदेश',
  'Minutes': 'मिनट',
  'Missing': 'लापता',
  'Monthly': 'मासिक',
  'Network': 'नेटवर्क',
  'Numbers': 'संख्याएं',
  'Offense': 'अपराध',
  'Officer': 'अधिकारी',
  'Pending': 'लंबित',
  'Preview': 'पूर्वावलोकन',
  'Process': 'प्रक्रिया',
  'Profile': 'प्रोफ़ाइल',
  'Records': 'रिकॉर्ड',
  'Refresh': 'ताज़ा करें',
  'Release': 'रिहाई',
  'Remarks': 'टिप्पणियां',
  'Reports': 'रिपोर्टें',
  'Request': 'अनुरोध',
  'Resolve': 'हल करें',
  'Results': 'परिणाम',
  'Robbery': 'डकैती',
  'Routine': 'सामान्य',
  'Scanner': 'स्कैनर',
  'Seconds': 'सेकंड',
  'Section': 'अनुभाग',
  'Secured': 'सुरक्षित किया गया',
  'Service': 'सेवा',
  'Session': 'सत्र',
  'Sidebar': 'साइडबार',
  'Similar': 'समान',
  'Special': 'विशेष',
  'Station': 'थाना',
  'Success': 'सफल',
  'Summary': 'सारांश',
  'Suspect': 'संदिग्ध',
  'Timeout': 'समय समाप्त',
  'Traffic': 'यातायात',
  'Unknown': 'अज्ञात',
  'Updated': 'अपडेट किया गया',
  'Updates': 'अपडेट',
  'Uploads': 'अपलोड',
  'Urgency': 'तात्कालिकता',
  'Vehicle': 'वाहन',
  'Verdict': 'फैसला',
  'Victims': 'पीड़ित',
  'Warning': 'चेतावनी',
  'Warrant': 'वारंट',
  'Welcome': 'स्वागत है',
  'Witness': 'गवाह',
  'ACCESS': 'पहुंच',
  'Access': 'पहुंच',
  'Action': 'कार्रवाई',
  'Active': 'सक्रिय',
  'AI Insights': 'एआई अंतर्दृष्टि',
  'Insights': 'अंतर्दृष्टि',
  'Chat': 'चैट',
  'Time-line': 'समयरेखा',
  'PDF': 'पीडीएफ',
  'Alarms': 'अलार्म',
  'Alerts': 'अलर्ट',
  'Annual': 'वार्षिक',
  'Arrest': 'गिरफ्तारी',
  'Assign': 'नियुक्त करें',
  'Attack': 'हमला',
  'Bailed': 'जमानत पर',
  'Binary': 'बाइनरी',
  'Branch': 'शाखा',
  'Briefs': 'ब्रीफ',
  'Bright': 'ब्राइट',
  'Cancel': 'रद्द करें',
  'Center': 'केंद्र',
  'Closed': 'बंद',
  'Courts': 'अदालतें',
  'Create': 'बनाएं',
  'Crimes': 'अपराध',
  'Danger': 'खतरा',
  'Defend': 'बचाव करें',
  'Delete': 'हटाएं',
  'Direct': 'प्रत्यक्ष',
  'Edited': 'संपादित',
  'Expert': 'विशेषज्ञ',
  'Export': 'निर्यात',
  'Female': 'महिला',
  'Filter': 'फ़िल्टर',
  'Gender': 'लिंग',
  'Images': 'छवियां',
  'Issued': 'जारी किया गया',
  'Ledger': 'बहीखाता',
  'Linked': 'जुड़ा हुआ',
  'Locked': 'लॉक किया गया',
  'Logout': 'लॉगआउट',
  'Manage': 'प्रबंधित करें',
  'Marked': 'चिह्नित',
  'Master': 'मास्टर',
  'Matrix': 'मैट्रिक्स',
  'Medium': 'मध्यम',
  'Member': 'सदस्य',
  'Minute': 'मिनट',
  'Mobile': 'मोबाइल',
  'Murder': 'कत्ल',
  'Normal': 'सामान्य',
  'Notice': 'सूचना',
  'Number': 'संख्या',
  'Office': 'कार्यालय',
  'Online': 'ऑनलाइन',
  'Others': 'अन्य',
  'Patrol': 'गश्त',
  'Person': 'व्यक्ति',
  'Photos': 'तस्वीरें',
  'Police': 'पुलिस',
  'Portal': 'पोर्टल',
  'Public': 'सार्वजनिक',
  'Recent': 'हालिया',
  'Record': 'रिकॉर्ड',
  'Reject': 'अस्वीकार करें',
  'Remove': 'हटाएं',
  'Report': 'रिपोर्ट',
  'Result': 'परिणाम',
  'Review': 'समीक्षा',
  'Search': 'खोजें',
  'Second': 'सेकंड',
  'Secure': 'सुरक्षित',
  'Select': 'चुनें',
  'Signal': 'सिग्नल',
  'Solved': 'हल किया गया',
  'States': 'राज्य',
  'Status': 'स्थिति',
  'Submit': 'सबमिट करें',
  'System': 'प्रणाली',
  'Target': 'लक्ष्य',
  'Toggle': 'बदलें',
  'Trends': 'प्रवृत्तियां',
  'Unlock': 'अनलॉक',
  'Update': 'अपडेट',
  'Upload': 'अपलोड',
  'Urgent': 'अति-आवश्यक',
  'Verify': 'सत्यापित करें',
  'Victim': 'पीड़ित',
  'Wanted': 'वांछित',
  'Alert': 'अलर्ट',
  'Apple': 'एप्पल',
  'Armed': 'सशस्त्र',
  'Arson': 'आगजनी',
  'Audio': 'ऑडियो',
  'Audit': 'ऑडिट',
  'Badge': 'बैज',
  'Basic': 'बुनियादी',
  'Bench': 'पीठ',
  'Blood': 'रक्त',
  'Brief': 'ब्रीफ',
  'Cases': 'मामले',
  'Chart': 'चार्ट',
  'Check': 'जांचें',
  'Civil': 'दीवानी',
  'Clear': 'साफ़ करें',
  'Clerk': 'लिपिक',
  'Click': 'क्लिक करें',
  'Close': 'बंद करें',
  'Court': 'अदालत',
  'Crime': 'अपराध',
  'Cyber': 'साइबर',
  'Daily': 'दैनिक',
  'Drive': 'ड्राइव',
  'Email': 'ईमेल',
  'Enrol': 'नामांकन करें',
  'Enter': 'दर्ज करें',
  'Error': 'त्रुटि',
  'False': 'असत्य',
  'Field': 'फील्ड',
  'Files': 'फ़ाइलें',
  'Final': 'अंतिम',
  'Flash': 'फ्लैश',
  'Fraud': 'धोखाधड़ी',
  'Graph': 'ग्राफ',
  'Group': 'समूह',
  'Guard': 'रक्षक',
  'Hours': 'घंटे',
  'Image': 'छवि',
  'Input': 'इनपुट',
  'Issue': 'जारी करें',
  'Legal': 'कानूनी',
  'Level': 'स्तर',
  'Limit': 'सीमा',
  'Login': 'लॉगिन',
  'Marks': 'चिह्न',
  'Match': 'मिलान',
  'Model': 'मॉडल',
  'Month': 'महीना',
  'North': 'उत्तर',
  'Notes': 'नोट्स',
  'Order': 'आदेश',
  'Other': 'अन्य',
  'Panel': 'पैनल',
  'Phone': 'फ़ोन',
  'Photo': 'तस्वीर',
  'Plate': 'नंबर प्लेट',
  'Print': 'प्रिंट',
  'Proof': 'प्रमाण',
  'Query': 'क्वेरी',
  'Quick': 'त्वरित',
  'Radio': 'रेडियो',
  'Reset': 'रीसेट',
  'Roles': 'भूमिकाएं',
  'Saved': 'सहेजा गया',
  'Scene': 'स्थल',
  'Score': 'स्कोर',
  'Share': 'साझा करें',
  'South': 'दक्षिण',
  'State': 'राज्य',
  'Steps': 'चरण',
  'Table': 'तालिका',
  'Tasks': 'कार्य',
  'Teams': 'टीमें',
  'Terms': 'शर्तें',
  'Theft': 'चोरी',
  'Theme': 'थीम',
  'Title': 'शीर्षक',
  'Today': 'आज',
  'Total': 'कुल',
  'Track': 'ट्रैक करें',
  'Trail': 'ट्रेल',
  'Trend': 'प्रवृत्ति',
  'Types': 'प्रकार',
  'Under': 'के अंतर्गत',
  'Units': 'इकाइयां',
  'Users': 'उपयोगकर्ता',
  'Valid': 'वैध',
  'Video': 'वीडियो',
  'Views': 'दृश्य',
  'Watch': 'देखें',
  'Weeks': 'सप्ताह',
  'Years': 'वर्ष',
  'APBs': 'एपीबी',
  'Area': 'क्षेत्र',
  'Arms': 'हथियार',
  'Auto': 'स्वतः',
  'Bail': 'जमानत',
  'Bank': 'बैंक',
  'Case': 'केस',
  'Cell': 'प्रकोष्ठ',
  'City': 'शहर',
  'Code': 'कोड',
  'Copy': 'कॉपी',
  'Dark': 'डार्क',
  'Data': 'डेटा',
  'Date': 'तारीख',
  'Days': 'दिन',
  'Demo': 'डेमो',
  'Desk': 'डेस्क',
  'Dial': 'डायल करें',
  'Edit': 'संपादित करें',
  'File': 'फ़ाइल',
  'Form': 'फॉर्म',
  'Full': 'पूरा',
  'Hash': 'हैश',
  'Head': 'प्रमुख',
  'Help': 'सहायता',
  'High': 'उच्च',
  'Host': 'होस्ट',
  'Hour': 'घंटा',
  'Info': 'जानकारी',
  'Iris': 'आईरिस',
  'Last': 'अंतिम',
  'Line': 'लाइन',
  'Link': 'लिंक',
  'List': 'सूची',
  'Live': 'लाइव',
  'Load': 'लोड',
  'Lock': 'लॉक',
  'Logs': 'लॉग',
  'Male': 'पुरुष',
  'Mark': 'चिह्नित करें',
  'Menu': 'मेनू',
  'Mins': 'मिनट',
  'Mode': 'मोड',
  'More': 'अधिक',
  'Name': 'नाम',
  'Next': 'अगला',
  'None': 'कोई नहीं',
  'Open': 'खोलें',
  'Page': 'पृष्ठ',
  'Raid': 'छापेमारी',
  'Rank': 'पद',
  'Risk': 'जोखिम',
  'Role': 'भूमिका',
  'Save': 'सहेजें',
  'Scan': 'स्कैन',
  'Secs': 'सेकंड',
  'Send': 'भेजें',
  'Sent': 'भेजा गया',
  'Show': 'दिखाएं',
  'Side': 'पक्ष',
  'Sign': 'हस्ताक्षर',
  'Size': 'आकार',
  'Slip': 'पर्ची',
  'Step': 'चरण',
  'Task': 'कार्य',
  'Team': 'टीम',
  'Time': 'समय',
  'True': 'सत्य',
  'Type': 'प्रकार',
  'Unit': 'इकाई',
  'User': 'उपयोगकर्ता',
  'View': 'देखें',
  'Week': 'सप्ताह',
  'West': 'पश्चिम',
  'Year': 'वर्ष',
  'Zone': 'क्षेत्र',
  'AES': 'एईएस',
  'APB': 'एपीबी',
  'Act': 'अधिनियम',
  'Add': 'जोड़ें',
  'Age': 'आयु',
  'All': 'सभी',
  'Day': 'दिन',
  'Eye': 'आईरिस / आंख',
  'FIR': 'एफआईआर',
  'Key': 'कुंजी',
  'Lab': 'प्रयोगशाला',
  'Law': 'कानून',
  'Log': 'लॉग',
  'Low': 'कम',
  'Map': 'मानचित्र',
  'Min': 'मिनट',
  'New': 'नया',
  'Sec': 'सेकंड',
  'Set': 'तय करें',
  'Tag': 'टैग',
  'Tip': 'टिप / सूचना',
  'Yes': 'हाँ',
  'AM': 'पूर्वाह्न',
  'ID': 'आईडी',
  'No': 'नहीं',
  'PM': 'अपराह्न',
};

// Pre-sorted translation keys
const SORTED_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const SORTED_WORDS = Object.keys(WORD_MAP).sort((a, b) => b.length - a.length);

/**
 * Universal Hindi translation function for any text in Crime Matrix Portal
 */
export function translateToHindi(text: string): string {
  if (!text) return text;

  // 1. Direct exact match
  if (TRANSLATIONS[text]) {
    return TRANSLATIONS[text];
  }

  // 2. Exact match with whitespace preserved
  const trimmed = text.trim();
  if (TRANSLATIONS[trimmed]) {
    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    return leading + TRANSLATIONS[trimmed] + trailing;
  }

  // If text is purely numeric, punctuation, or technical code (e.g. SHA-256 hashes, URLs, UUIDs), return as is
  if (/^[0-9\s.,:/#@*+=_\-()[\]%]+$/.test(text)) {
    return text;
  }
  if (text.startsWith('http://') || text.startsWith('https://') || text.includes('@gmail.com') || /^[a-f0-9]{32,64}$/i.test(text)) {
    return text;
  }

  let result = text;

  // 3. Multi-phrase replacement using sorted dictionary keys with boundary lookaround
  for (let i = 0; i < SORTED_KEYS.length; i++) {
    const key = SORTED_KEYS[i];
    if (key.length < 3) continue;

    if (result.includes(key)) {
      const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|(?<=[^a-zA-Z0-9]))${escaped}(?=[^a-zA-Z0-9]|$)`, 'g');
      result = result.replace(regex, TRANSLATIONS[key]);
    }
  }

  // 4. Word-level replacement for any residual English terms
  if (/[a-zA-Z]/.test(result)) {
    for (let i = 0; i < SORTED_WORDS.length; i++) {
      const word = SORTED_WORDS[i];
      if (word.length < 2) continue;

      const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|(?<=[^a-zA-Z0-9]))${escaped}(?=[^a-zA-Z0-9]|$)`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, WORD_MAP[word]);
      }
    }
  }

  return result;
}

// Reverse translation dictionary for Hindi -> English
export const REVERSE_TRANSLATIONS: Record<string, string> = {
  // Explicit high-priority overrides
  'क्राइम मैट्रिक्स': 'CRIME MATRIX',
  'सत्य • साक्ष्य • न्याय': 'TRUTH • EVIDENCE • JUSTICE',
  'सत्यमेव जयते': 'SATYAMEVA JAYATE',
  'लॉगिन': 'Login',
  'सुरक्षित न्यायिक सूचना प्रणाली': 'Secure Judicial Information System',
  'चुनें पद / भूमिका:': 'Select Role:',
  'पद / भूमिका चुनें:': 'Select Role:',
  'भूमिका चुनें:': 'Select Role:',
  'पद / भूमिका चुनें': 'Select Role',
  'भूमिका चुनें': 'Select Role',
  'ब्राइट मोड': 'BRIGHT MODE',
  'डार्क मोड': 'DARK MODE',
  'डीएसपी': 'SHO/Inspector',
  'होस्ट': 'Investigator',
  'एसएचओ/इंस्पेक्टर': 'SHO/Inspector',
  'इन्वेस्टिगेटर': 'Investigator',
  'पुलिस अधिकारी': 'Police Officer',
  'पीड़ित': 'Victim',
  'अधिवक्ता': 'Advocate',
  'विभाग प्रमुख': 'Dept Head',
  'मुख्य पुलिस व्यवस्थापक': 'Main Police Admin',
  'फील्ड इंस्पेक्टर': 'Field Inspector',
  'केस शिकायतकर्ता': 'Case Complainant',
  'एजेंसी पहचानकर्ता / यूज़रनेम': 'Agency Identifier / Username',
  'AGENCY IDENTIFIER / यूज़रनेम': 'AGENCY IDENTIFIER / USERNAME',
  'दर्ज करें your आईडी': 'Enter your ID',
  'अपनी आईडी दर्ज करें': 'Enter your ID',
  'सुरक्षा पासवर्ड': 'Security Password',
  'सुरक्षा पासवर्ड दर्ज करें': 'Enter security password',
  'पुलिस लाइन पार न करें': 'POLICE LINE DO NOT CROSS',
  'अपराध स्थल साक्ष्य क्षेत्र': 'CRIME SCENE EVIDENCE ZONE',
  'सावधानी: उच्च सुरक्षा क्षेत्र': 'CAUTION: HIGH SECURITY AREA',
  'केवल कानून प्रवर्तन': 'LAW ENFORCEMENT ONLY',
  'प्रतिबंधित डेटा एक्सेस': 'RESTRICTED DATA ACCESS',
  'क्राइम मैट्रिक्स सिस्टम': 'CRIME MATRIX SYSTEM',
  'सुरक्षित डेटा एन्क्रिप्शन': 'SECURE DATA ENCRYPTION',
  'फोरेंसिक लॉग सत्यापित': 'FORENSIC LOGS VERIFIED',
  'फोरेंसIC लॉग सत्यापित': 'FORENSIC LOGS VERIFIED',
  'स्वीकृति लंबित': 'Pending Approval',
  'लंबित अनुमोदन': 'Pending Approvals',
  'संदिग्ध ट्रैकिंग': 'Suspect Tracking',
  'नई पुलिस एफआईआर दर्ज करें': 'Register New Police FIR',
  'सत्यापित करें और एफआईआर दर्ज करें': 'Verify & Register FIR',
  'नागरिक शिकायत (ई-एफआईआर) दर्ज करें': 'Register Citizen Complaint (e-FIR)',
  'केस प्रबंधन': 'Case Management',
  'अलर्ट एवं एपीबी': 'Alerts & APB',
  'अनुरोध एवं पहुंच': 'Requests & Access',
  'शेड्यूल एवं ड्यूटी': 'Schedule & Duties',
  'अधिकारी पंजीकरण': 'Officer Registration',
  'नागरिक शिकायतें': 'Citizen Complaints',
  'सिस्टम सेटिंग्स': 'System Settings',
  'लॉगआउट': 'Logout',
  'उपयोगकर्ता प्रोफ़ाइल': 'User Profile',
  'डैशबोर्ड': 'Dashboard',
  'आईरिस सत्यापन': 'Iris Verification',
  'कैप्चा सत्यापन': 'CAPTCHA Verification',
  'एवं': '&',
  'और': 'and',
  'सिस्टम': 'System',
  'शेड्यूल': 'Schedule',
  'ड्यूटी': 'Duty',
  'कर्तव्य': 'Duty',
  'यूज़रनेम': 'Username',
  'पासवर्ड': 'Password',
  'सुरक्षा': 'Security',
  'आईडी': 'ID',
  'दर्ज करें': 'Enter',
};

// Auto-populate reverse translations from forward translations
for (const [enKey, hiVal] of Object.entries(TRANSLATIONS)) {
  const trimmedHi = hiVal.trim();
  const trimmedEn = enKey.trim();
  if (!trimmedHi || !trimmedEn) continue;
  if (!REVERSE_TRANSLATIONS[trimmedHi] || trimmedEn.length > REVERSE_TRANSLATIONS[trimmedHi].length) {
    REVERSE_TRANSLATIONS[trimmedHi] = trimmedEn;
  }
}

for (const [enWord, hiWord] of Object.entries(WORD_MAP)) {
  const trimmedHi = hiWord.trim();
  const trimmedEn = enWord.trim();
  if (!trimmedHi || !trimmedEn) continue;
  if (!REVERSE_TRANSLATIONS[trimmedHi]) {
    REVERSE_TRANSLATIONS[trimmedHi] = trimmedEn;
  }
}

const SORTED_REVERSE_KEYS = Object.keys(REVERSE_TRANSLATIONS).sort((a, b) => b.length - a.length);

/**
 * Universal English translation function for any Hindi text in Crime Matrix Portal
 */
export function translateToEnglish(text: string): string {
  if (!text) return text;

  // 1. Direct exact match
  if (REVERSE_TRANSLATIONS[text]) {
    return REVERSE_TRANSLATIONS[text];
  }

  // 2. Exact match with whitespace preserved
  const trimmed = text.trim();
  if (REVERSE_TRANSLATIONS[trimmed]) {
    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    return leading + REVERSE_TRANSLATIONS[trimmed] + trailing;
  }

  // If text contains no Hindi/Devanagari characters, it is already English
  if (!/[\u0900-\u097F]/.test(text)) {
    return text;
  }

  let result = text;

  // Multi-phrase replacement using pre-sorted reverse keys (longest first)
  for (let i = 0; i < SORTED_REVERSE_KEYS.length; i++) {
    const hiKey = SORTED_REVERSE_KEYS[i];
    if (hiKey.length < 2) continue;

    if (result.includes(hiKey)) {
      result = result.split(hiKey).join(REVERSE_TRANSLATIONS[hiKey]);
      if (!/[\u0900-\u097F]/.test(result)) {
        break;
      }
    }
  }

  return result;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage for known true English content of DOM nodes
const englishTextMap = new WeakMap<Node, string>();
const englishAttrMap = new WeakMap<Element, { placeholder?: string; title?: string; 'aria-label'?: string }>();

const isEnglishText = (str: string) => /[a-zA-Z]/.test(str);
const hasHindiText = (str: string) => /[\u0900-\u097F]/.test(str);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('crime_matrix_lang');
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const observerRef = useRef<MutationObserver | null>(null);
  const isWorkingRef = useRef(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('crime_matrix_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (text: string, fallback?: string): string => {
    if (!text) return text;
    if (language === 'en') {
      if (text === 'DSP') return 'SHO/Inspector';
      if (text === 'Host') return 'Investigator';
      if (text === 'DSP PORTAL') return 'SHO/Inspector PORTAL';
      if (text === 'Host PORTAL') return 'Investigator PORTAL';
      if (text === 'DSP (Deputy Superintendent of Police)') return 'SHO/Inspector (Station House Officer)';
      if (text === 'Host (Station Head)') return 'Investigator (Lead Investigation Officer)';
      if (hasHindiText(text)) {
        return translateToEnglish(text) || fallback || text;
      }
      return fallback || text;
    }
    // Hindi requested
    if (text === 'DSP' || text === 'SHO/Inspector') return 'एसएचओ/इंस्पेक्टर';
    if (text === 'Host' || text === 'Investigator') return 'इन्वेस्टिगेटर (जांच अधिकारी)';
    if (text === 'DSP PORTAL' || text === 'SHO/Inspector PORTAL') return 'एसएचओ/इंस्पेक्टर पोर्टल';
    if (text === 'Host PORTAL' || text === 'Investigator PORTAL') return 'इन्वेस्टिगेटर पोर्टल';
    if (hasHindiText(text)) {
      return text;
    }
    return translateToHindi(text) || fallback || text;
  };

  // DOM Live Translation Engine (Bidirectional English <-> Hindi)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;

    const translateNodeToHindi = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        if (!val || !val.trim()) return;

        const parent = node.parentElement;
        if (parent) {
          const tag = parent.tagName.toUpperCase();
          if (
            tag === 'SCRIPT' ||
            tag === 'STYLE' ||
            tag === 'NOSCRIPT' ||
            tag === 'CODE' ||
            tag === 'PRE' ||
            parent.closest('[data-no-translate="true"]') !== null ||
            parent.isContentEditable
          ) {
            return;
          }
        }

        // Save original English if not already saved
        if (isEnglishText(val) && !hasHindiText(val)) {
          englishTextMap.set(node, val);
        }

        const source = englishTextMap.get(node) || val;
        if (isEnglishText(source)) {
          const translated = translateToHindi(source);
          if (node.nodeValue !== translated) {
            node.nodeValue = translated;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toUpperCase();
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
        if (el.closest('[data-no-translate="true"]')) return;

        const placeholder = el.getAttribute('placeholder');
        if (placeholder && placeholder.trim()) {
          if (isEnglishText(placeholder) && !hasHindiText(placeholder)) {
            const stored = englishAttrMap.get(el) || {};
            stored.placeholder = placeholder;
            englishAttrMap.set(el, stored);
          }
          const source = englishAttrMap.get(el)?.placeholder || placeholder;
          if (isEnglishText(source)) {
            const tr = translateToHindi(source);
            if (el.getAttribute('placeholder') !== tr) {
              el.setAttribute('placeholder', tr);
            }
          }
        }

        const title = el.getAttribute('title');
        if (title && title.trim()) {
          if (isEnglishText(title) && !hasHindiText(title)) {
            const stored = englishAttrMap.get(el) || {};
            stored.title = title;
            englishAttrMap.set(el, stored);
          }
          const source = englishAttrMap.get(el)?.title || title;
          if (isEnglishText(source)) {
            const tr = translateToHindi(source);
            if (el.getAttribute('title') !== tr) {
              el.setAttribute('title', tr);
            }
          }
        }

        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim()) {
          if (isEnglishText(ariaLabel) && !hasHindiText(ariaLabel)) {
            const stored = englishAttrMap.get(el) || {};
            stored['aria-label'] = ariaLabel;
            englishAttrMap.set(el, stored);
          }
          const source = englishAttrMap.get(el)?.['aria-label'] || ariaLabel;
          if (isEnglishText(source)) {
            const tr = translateToHindi(source);
            if (el.getAttribute('aria-label') !== tr) {
              el.setAttribute('aria-label', tr);
            }
          }
        }

        for (let i = 0; i < el.childNodes.length; i++) {
          translateNodeToHindi(el.childNodes[i]);
        }
      }
    };

    const translateNodeToEnglish = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        if (!val || !val.trim()) return;

        const parent = node.parentElement;
        if (parent) {
          const tag = parent.tagName.toUpperCase();
          if (
            tag === 'SCRIPT' ||
            tag === 'STYLE' ||
            tag === 'NOSCRIPT' ||
            tag === 'CODE' ||
            tag === 'PRE' ||
            parent.closest('[data-no-translate="true"]') !== null ||
            parent.isContentEditable
          ) {
            return;
          }
        }

        if (hasHindiText(val)) {
          if (englishTextMap.has(node) && !hasHindiText(englishTextMap.get(node)!)) {
            const orig = englishTextMap.get(node)!;
            if (node.nodeValue !== orig) {
              node.nodeValue = orig;
            }
          } else {
            const en = translateToEnglish(val);
            if (node.nodeValue !== en) {
              node.nodeValue = en;
            }
          }
        } else if (isEnglishText(val) && !englishTextMap.has(node)) {
          englishTextMap.set(node, val);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toUpperCase();
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
        if (el.closest('[data-no-translate="true"]')) return;

        const placeholder = el.getAttribute('placeholder');
        if (placeholder && hasHindiText(placeholder)) {
          const stored = englishAttrMap.get(el)?.placeholder;
          if (stored && !hasHindiText(stored)) {
            el.setAttribute('placeholder', stored);
          } else {
            el.setAttribute('placeholder', translateToEnglish(placeholder));
          }
        }

        const title = el.getAttribute('title');
        if (title && hasHindiText(title)) {
          const stored = englishAttrMap.get(el)?.title;
          if (stored && !hasHindiText(stored)) {
            el.setAttribute('title', stored);
          } else {
            el.setAttribute('title', translateToEnglish(title));
          }
        }

        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && hasHindiText(ariaLabel)) {
          const stored = englishAttrMap.get(el)?.['aria-label'];
          if (stored && !hasHindiText(stored)) {
            el.setAttribute('aria-label', stored);
          } else {
            el.setAttribute('aria-label', translateToEnglish(ariaLabel));
          }
        }

        for (let i = 0; i < el.childNodes.length; i++) {
          translateNodeToEnglish(el.childNodes[i]);
        }
      }
    };

    if (language === 'hi') {
      translateNodeToHindi(document.body);

      const observer = new MutationObserver((mutations) => {
        if (isWorkingRef.current) return;
        isWorkingRef.current = true;
        try {
          observer.disconnect();
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              for (let i = 0; i < mutation.addedNodes.length; i++) {
                translateNodeToHindi(mutation.addedNodes[i]);
              }
            } else if (mutation.type === 'characterData' && mutation.target) {
              translateNodeToHindi(mutation.target);
            }
          }
        } finally {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
          });
          isWorkingRef.current = false;
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      observerRef.current = observer;

      const intervalId = setInterval(() => {
        if (language === 'hi') {
          translateNodeToHindi(document.body);
        }
      }, 400);

      return () => {
        clearInterval(intervalId);
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    } else {
      // Language is 'en'
      translateNodeToEnglish(document.body);

      const observer = new MutationObserver((mutations) => {
        if (isWorkingRef.current) return;
        isWorkingRef.current = true;
        try {
          observer.disconnect();
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              for (let i = 0; i < mutation.addedNodes.length; i++) {
                translateNodeToEnglish(mutation.addedNodes[i]);
              }
            } else if (mutation.type === 'characterData' && mutation.target) {
              translateNodeToEnglish(mutation.target);
            }
          }
        } finally {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
          });
          isWorkingRef.current = false;
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      observerRef.current = observer;

      const intervalId = setInterval(() => {
        if (language === 'en') {
          translateNodeToEnglish(document.body);
        }
      }, 400);

      return () => {
        clearInterval(intervalId);
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
