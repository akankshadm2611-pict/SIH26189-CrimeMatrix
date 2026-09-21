// Complete Directory of Indian States, Districts, and Talukas / Subdivisions

export interface StateLocationData {
  state: string;
  districts: {
    district: string;
    talukas: string[];
  }[];
}

export const ALL_INDIAN_STATES: StateLocationData[] = [
  {
    state: 'Maharashtra',
    districts: [
      {
        district: 'Ahmednagar (Ahilyanagar)',
        talukas: ['Nagar', 'Rahata', 'Shirdi', 'Sangamner', 'Kopargaon', 'Akole', 'Shrirampur', 'Nevasa', 'Shevgaon', 'Pathardi', 'Jamkhed', 'Karjat', 'Shrigonda', 'Parner'],
      },
      {
        district: 'Akola',
        talukas: ['Akola', 'Akot', 'Telhara', 'Balapur', 'Patur', 'Murtizapur', 'Barshitakli'],
      },
      {
        district: 'Amravati',
        talukas: ['Amravati', 'Achalpur', 'Chandurbazar', 'Morshi', 'Warud', 'Daryapur', 'Anjangaon Surji', 'Dharni', 'Chikhaldara', 'Nandgaon Khandeshwar'],
      },
      {
        district: 'Beed',
        talukas: ['Beed', 'Georai', 'Majalgaon', 'Ambejogai', 'Kaij', 'Ashti', 'Patoda', 'Shirur Kasar', 'Wadwani', 'Dharur', 'Parli'],
      },
      {
        district: 'Bhandara',
        talukas: ['Bhandara', 'Tumsar', 'Pauni', 'Mohadi', 'Sakoli', 'Lakhani', 'Lakhandur'],
      },
      {
        district: 'Buldhana',
        talukas: ['Buldhana', 'Chikhli', 'Deulgaon Raja', 'Jalgaon Jamod', 'Sangrampur', 'Malkapur', 'Motala', 'Nandura', 'Khamgaon', 'Shegaon', 'Mehkar', 'Sindkhed Raja', 'Lonar'],
      },
      {
        district: 'Chandrapur',
        talukas: ['Chandrapur', 'Bhadravati', 'Warora', 'Chimur', 'Nagbhid', 'Brahmapuri', 'Sindewahi', 'Mul', 'Saoli', 'Pombhurna', 'Ballarpur', 'Korpana', 'Rajura', 'Jiwati'],
      },
      {
        district: 'Chhatrapati Sambhajinagar (Aurangabad)',
        talukas: ['Aurangabad', 'Paithan', 'Gangapur', 'Vaijapur', 'Kannad', 'Khuldabad', 'Sillod', 'Soegaon', 'Phulambri'],
      },
      {
        district: 'Dhule',
        talukas: ['Dhule', 'Sakri', 'Sindkheda', 'Shirpur'],
      },
      {
        district: 'Dharashiv (Osmanabad)',
        talukas: ['Osmanabad', 'Tuljapur', 'Omerga', 'Lohara', 'Kallam', 'Bhum', 'Paranda', 'Washi'],
      },
      {
        district: 'Gadchiroli',
        talukas: ['Gadchiroli', 'Dhanora', 'Chamorshi', 'Mulchera', 'Armori', 'Desaiganj', 'Kurkheda', 'Korchi', 'Aheri', 'Etapalli', 'Bhamragad', 'Sironcha'],
      },
      {
        district: 'Gondia',
        talukas: ['Gondia', 'Tirora', 'Goregaon', 'Arjuni Morgaon', 'Deori', 'Amgaon', 'Salekasa', 'Sadak Arjuni'],
      },
      {
        district: 'Hingoli',
        talukas: ['Hingoli', 'Kalamnuri', 'Basmath', 'Aundha Nagnath', 'Sengaon'],
      },
      {
        district: 'Jalgaon',
        talukas: ['Jalgaon', 'Bhusawal', 'Chalisgaon', 'Pachora', 'Jamner', 'Raver', 'Yawal', 'Amalner', 'Erandol', 'Parola', 'Chopda', 'Bodwad', 'Bhadgaon', 'Dharangaon', 'Muktainagar'],
      },
      {
        district: 'Jalna',
        talukas: ['Jalna', 'Bhokardan', 'Jafrabad', 'Badnapur', 'Ambad', 'Ghansawangi', 'Partur', 'Mantha'],
      },
      {
        district: 'Kolhapur',
        talukas: ['Karvir', 'Panhala', 'Shahuwadi', 'Kagal', 'Hatkanangle', 'Shirol', 'Radhanagari', 'Gaganbawda', 'Bhudargad', 'Gadhinglaj', 'Chandgad', 'Ajra'],
      },
      {
        district: 'Latur',
        talukas: ['Latur', 'Ausa', 'Nilanga', 'Renapur', 'Chakur', 'Deoni', 'Shirur Anantpal', 'Ahmedpur', 'Jalkot', 'Udgir'],
      },
      {
        district: 'Mumbai City',
        talukas: ['Colaba', 'Fort', 'Malabar Hill', 'Byculla', 'Dadar', 'Worli'],
      },
      {
        district: 'Mumbai Suburban',
        talukas: ['Andheri', 'Bandra', 'Kurla', 'Borivali', 'Goregaon', 'Ghatkopar', 'Mulund'],
      },
      {
        district: 'Nagpur',
        talukas: ['Nagpur Urban', 'Nagpur Rural', 'Kamptee', 'Hingna', 'Katol', 'Narkhed', 'Savner', 'Kalameshwar', 'Ramtek', 'Mouda', 'Umred', 'Kuhi', 'Bhivapur'],
      },
      {
        district: 'Nanded',
        talukas: ['Nanded', 'Biloli', 'Mukhed', 'Kandhar', 'Loha', 'Hadgaon', 'Bhokar', 'Deglur', 'Kinwat', 'Mudkhed', 'Himayatnagar', 'Mahur'],
      },
      {
        district: 'Nandurbar',
        talukas: ['Nandurbar', 'Navapur', 'Shahada', 'Taloda', 'Akkalkuwa', 'Akrani (Dhadgaon)'],
      },
      {
        district: 'Nashik',
        talukas: ['Nashik', 'Malegaon', 'Sinnar', 'Niphad', 'Dindori', 'Igatpuri', 'Kalwan', 'Baglan', 'Yeola', 'Chandwad', 'Nandgaon', 'Surgana', 'Peth', 'Trimbakeshwar', 'Deola'],
      },
      {
        district: 'Palghar',
        talukas: ['Palghar', 'Vasai', 'Dahanu', 'Talasari', 'Jawhar', 'Mokhada', 'Wada', 'Vikramgad'],
      },
      {
        district: 'Parbhani',
        talukas: ['Parbhani', 'Gangakhed', 'Sonpeth', 'Pathri', 'Manwath', 'Palam', 'Selu', 'Jintur', 'Purna'],
      },
      {
        district: 'Pune',
        talukas: ['Pune City', 'Haveli', 'Maval', 'Mulshi', 'Shirur', 'Baramati', 'Indapur', 'Daund', 'Bhor', 'Velhe', 'Purandar', 'Junnar', 'Khed', 'Ambegaon'],
      },
      {
        district: 'Raigad',
        talukas: ['Alibag', 'Panvel', 'Uran', 'Karjat', 'Khalapur', 'Mangaon', 'Roha', 'Mahad', 'Poladpur', 'Murud', 'Shrivardhan', 'Tala'],
      },
      {
        district: 'Ratnagiri',
        talukas: ['Ratnagiri', 'Chiplun', 'Khed', 'Guhagar', 'Dapoli', 'Mandangad', 'Sangameshwar', 'Lanja', 'Rajapur'],
      },
      {
        district: 'Sangli',
        talukas: ['Miraj', 'Tasgaon', 'Khanapur', 'Atpadi', 'Jat', 'Kavathe Mahankal', 'Walwa', 'Shirala', 'Kadegaon', 'Palus'],
      },
      {
        district: 'Satara',
        talukas: ['Satara', 'Wai', 'Khandala', 'Jawali', 'Mahabaleshwar', 'Phaltan', 'Maan', 'Khatav', 'Koregaon', 'Patan', 'Karad'],
      },
      {
        district: 'Sindhudurg',
        talukas: ['Kudal', 'Kankavli', 'Sawantwadi', 'Malvan', 'Vengurla', 'Devgad', 'Dodamarg', 'Vaibhavwadi'],
      },
      {
        district: 'Solapur',
        talukas: ['North Solapur', 'South Solapur', 'Barshi', 'Pandharpur', 'Sangola', 'Karmala', 'Madha', 'Malshiras', 'Mohol', 'Mangalwedha', 'Akkalkot'],
      },
      {
        district: 'Thane',
        talukas: ['Thane', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Murbad', 'Shahapur'],
      },
      {
        district: 'Wardha',
        talukas: ['Wardha', 'Deoli', 'Seloo', 'Arvi', 'Ashti', 'Karanja', 'Hinganghat', 'Samudrapur'],
      },
      {
        district: 'Washim',
        talukas: ['Washim', 'Malegaon', 'Risod', 'Mangrulpir', 'Karanja', 'Manora'],
      },
      {
        district: 'Yavatmal',
        talukas: ['Yavatmal', 'Arni', 'Babhulgaon', 'Kalamb', 'Darwha', 'Digras', 'Ner', 'Pusad', 'Umarkhed', 'Mahagaon', 'Wani', 'Maregaon', 'Zari Jamani', 'Ralegaon', 'Ghatanji', 'Kelapur'],
      },
    ],
  },
  {
    state: 'Delhi (NCT)',
    districts: [
      { district: 'Central Delhi', talukas: ['Karol Bagh', 'Kotwali', 'Civil Lines', 'Daryaganj'] },
      { district: 'New Delhi', talukas: ['Chanakyapuri', 'Delhi Cantonment', 'Vasant Vihar', 'Connaught Place'] },
      { district: 'South Delhi', talukas: ['Saket', 'Hauz Khas', 'Mehrauli', 'Greater Kailash'] },
      { district: 'South East Delhi', talukas: ['Defence Colony', 'Kalkaji', 'Sarita Vihar', 'Lajpat Nagar'] },
      { district: 'South West Delhi', talukas: ['Dwarka', 'Najafgarh', 'Kapashera', 'Palam'] },
      { district: 'West Delhi', talukas: ['Patel Nagar', 'Punjabi Bagh', 'Rajouri Garden', 'Janakpuri'] },
      { district: 'North Delhi', talukas: ['Model Town', 'Narela', 'Alipur', 'Burari'] },
      { district: 'North West Delhi', talukas: ['Rohini', 'Kanjhawala', 'Saraswati Vihar', 'Pitampura'] },
      { district: 'North East Delhi', talukas: ['Seelampur', 'Yamuna Vihar', 'Karawal Nagar'] },
      { district: 'East Delhi', talukas: ['Gandhi Nagar', 'Preet Vihar', 'Mayur Vihar', 'Patparganj'] },
      { district: 'Shahdara', talukas: ['Shahdara', 'Seemapuri', 'Vivek Vihar', 'Dilshad Garden'] },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      { district: 'Lucknow', talukas: ['Lucknow Sadar', 'Bakshi Ka Talab', 'Mohanlalganj', 'Sarojini Nagar', 'Malihabad'] },
      { district: 'Gautam Buddha Nagar (Noida)', talukas: ['Noida City', 'Dadri', 'Jewar', 'Greater Noida'] },
      { district: 'Ghaziabad', talukas: ['Ghaziabad Sadar', 'Modinagar', 'Loni'] },
      { district: 'Kanpur Nagar', talukas: ['Kanpur Sadar', 'Ghatampur', 'Bilhaur', 'Kalyanpur'] },
      { district: 'Varanasi', talukas: ['Varanasi Sadar', 'Pindra', 'Rajatalab'] },
      { district: 'Prayagraj (Allahabad)', talukas: ['Sadar', 'Phulpur', 'Koraon', 'Meja', 'Bara', 'Karchhana', 'Soraon', 'Handia'] },
      { district: 'Agra', talukas: ['Agra Sadar', 'Fatehabad', 'Kheragarh', 'Etmadpur', 'Bah', 'Kiraoli'] },
      { district: 'Meerut', talukas: ['Meerut Sadar', 'Mawana', 'Sardhana'] },
      { district: 'Gorakhpur', talukas: ['Sadar', 'Sahjanwa', 'Chauri Chaura', 'Bansgaon', 'Campierganj', 'Khajni', 'Gola'] },
      { district: 'Bareilly', talukas: ['Bareilly Sadar', 'Aonla', 'Baheri', 'Faridpur', 'Nawabganj', 'Meerganj'] },
      { district: 'Aligarh', talukas: ['Koil (Sadar)', 'Atrauli', 'Khair', 'Iglas', 'Gabhana'] },
      { district: 'Moradabad', talukas: ['Moradabad Sadar', 'Bilari', 'Kanth', 'Thakurdwara'] },
      { district: 'Ayodhya (Faizabad)', talukas: ['Sadar', 'Rudauli', 'Sohawal', 'Bikapur', 'Milkipur'] },
      { district: 'Jhansi', talukas: ['Jhansi Sadar', 'Mauranipur', 'Garautha', 'Moth', 'Tahrauli'] },
      { district: 'Mathura', talukas: ['Mathura Sadar', 'Chhata', 'Mant', 'Govardhan', 'Mahavan'] },
      { district: 'Muzaffarnagar', talukas: ['Muzaffarnagar Sadar', 'Budhana', 'Khatoli', 'Jansath'] },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      { district: 'Ahmedabad', talukas: ['Ahmedabad City', 'Daskroi', 'Sanand', 'Dholka', 'Viramgam', 'Bavla', 'Dhandhuka', 'Mandal', 'Detroj'] },
      { district: 'Surat', talukas: ['Surat City', 'Choryasi', 'Olpad', 'Kamrej', 'Mangrol', 'Mandvi', 'Bardoli', 'Mahuva', 'Palsana'] },
      { district: 'Vadodara', talukas: ['Vadodara City', 'Vadodara Rural', 'Padra', 'Karjan', 'Dabhoi', 'Waghodia', 'Savli', 'Desar'] },
      { district: 'Rajkot', talukas: ['Rajkot City', 'Rajkot Rural', 'Gondal', 'Jetpur', 'Dhoraji', 'Upleta', 'Morbi Road', 'Jasdan'] },
      { district: 'Gandhinagar', talukas: ['Gandhinagar', 'Kalol', 'Dehgam', 'Mansa'] },
      { district: 'Bhavnagar', talukas: ['Bhavnagar', 'Sihor', 'Palitana', 'Talaja', 'Mahuva', 'Gariadhar', 'Vallabhipur'] },
      { district: 'Jamnagar', talukas: ['Jamnagar', 'Dhrol', 'Jodiya', 'Lalpur', 'Kalavad', 'Jamjodhpur'] },
      { district: 'Junagadh', talukas: ['Junagadh City', 'Keshod', 'Mangrol', 'Manavadar', 'Malia', 'Visavadar', 'Vanthali', 'Bhesan'] },
      { district: 'Anand', talukas: ['Anand', 'Khambhat', 'Petlad', 'Borsad', 'Umreth', 'Tarapur', 'Sojitra', 'Anklav'] },
      { district: 'Bharuch', talukas: ['Bharuch', 'Ankleshwar', 'Jambusar', 'Vagra', 'Hansot', 'Amod', 'Jhagadia', 'Netrang'] },
      { district: 'Kutch', talukas: ['Bhuj', 'Gandhidham', 'Anjar', 'Mandvi', 'Mundra', 'Nakhatrana', 'Abdasa', 'Lakhpat', 'Rapar', 'Bhachau'] },
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      { district: 'Bengaluru Urban', talukas: ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal', 'Yelahanka'] },
      { district: 'Bengaluru Rural', talukas: ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala'] },
      { district: 'Mysuru', talukas: ['Mysuru', 'Nanjangud', 'Hunsur', 'Piriyapatna', 'T. Narasipura', 'K.R. Nagar', 'Saragur'] },
      { district: 'Belagavi', talukas: ['Belagavi', 'Chikkodi', 'Gokak', 'Athani', 'Bailhongal', 'Hukkeri', 'Khanapur', 'Ramdurg', 'Saundatti', 'Raybag'] },
      { district: 'Dakshina Kannada (Mangaluru)', talukas: ['Mangaluru', 'Bantwal', 'Belthangady', 'Puttur', 'Sullia', 'Moodbidri', 'Kadaba'] },
      { district: 'Dharwad (Hubballi-Dharwad)', talukas: ['Dharwad', 'Hubballi Urban', 'Hubballi Rural', 'Kundgol', 'Navalgund', 'Alnavar'] },
      { district: 'Kalaburagi (Gulbarga)', talukas: ['Kalaburagi', 'Aland', 'Afzalpur', 'Jevargi', 'Sedam', 'Chittapur', 'Chincholi'] },
      { district: 'Shivamogga', talukas: ['Shivamogga', 'Bhadravati', 'Sagar', 'Shikaripura', 'Soraba', 'Thirthahalli', 'Hosanagara'] },
      { district: 'Tumakuru', talukas: ['Tumakuru', 'Gubbi', 'Tiptur', 'Kunigal', 'Madhugiri', 'Sira', 'Pavagada', 'Koratagere', 'Turuvekere'] },
      { district: 'Udupi', talukas: ['Udupi', 'Kundapura', 'Karkala', 'Brahmavara', 'Byndoor', 'Kaup', 'Hebri'] },
    ],
  },
  {
    state: 'Tamil Nadu',
    districts: [
      { district: 'Chennai', talukas: ['Egmore', 'Mylapore', 'Tondiarpet', 'Guindy', 'Mambalam', 'Velachery', 'Ayanavaram', 'Aminjikarai', 'Perambur', 'Purasawalkam'] },
      { district: 'Coimbatore', talukas: ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam', 'Sulur', 'Annur', 'Kinathukadavu', 'Madukkarai', 'Perur'] },
      { district: 'Madurai', talukas: ['Madurai North', 'Madurai South', 'Melur', 'Thirumangalam', 'Vadipatti', 'Usilampatti', 'Peraiyur'] },
      { district: 'Tiruchirappalli', talukas: ['Tiruchirappalli East', 'Tiruchirappalli West', 'Srirangam', 'Manapparai', 'Lalgudi', 'Thuraiyur', 'Musiri'] },
      { district: 'Salem', talukas: ['Salem', 'Attur', 'Mettur', 'Omalur', 'Sankari', 'Edappadi', 'Gangavalli', 'Yercaud'] },
      { district: 'Tirunelveli', talukas: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram'] },
      { district: 'Kanchipuram', talukas: ['Kanchipuram', 'Sriperumbudur', 'Walajabad', 'Uthiramerur', 'Kundrathur'] },
      { district: 'Chengalpattu', talukas: ['Chengalpattu', 'Tambaram', 'Pallavaram', 'Vandalur', 'Maduranthakam', 'Tirukalukundram', 'Cheyyur'] },
    ],
  },
  {
    state: 'Telangana',
    districts: [
      { district: 'Hyderabad', talukas: ['Charminar', 'Secunderabad', 'Khairatabad', 'Golconda', 'Musheerabad', 'Amberpet', 'Asifnagar', 'Bahadurpura', 'Bandlaguda', 'Nampally', 'Shaikpet'] },
      { district: 'Ranga Reddy', talukas: ['Rajendranagar', 'Serilingampally', 'Chevella', 'Ibrahimpatnam', 'Maheshwaram', 'Shadnagar', 'Shamshabad'] },
      { district: 'Medchal-Malkajgiri', talukas: ['Malkajgiri', 'Medchal', 'Kukatpally', 'Quthbullapur', 'Alwal', 'Uppal', 'Ghatkesar', 'Kapra'] },
      { district: 'Warangal', talukas: ['Warangal', 'Khila Warangal', 'Geesugonda', 'Wardhannapet', 'Rayaparthy', 'Parvathagiri'] },
      { district: 'Karimnagar', talukas: ['Karimnagar', 'Huzurabad', 'Jammikunta', 'Choppadandi', 'Manakondur', 'Thimmapur'] },
      { district: 'Nizamabad', talukas: ['Nizamabad North', 'Nizamabad South', 'Bodhan', 'Armoor', 'Bheemgal', 'Kotgiri'] },
    ],
  },
  {
    state: 'Rajasthan',
    districts: [
      { district: 'Jaipur', talukas: ['Jaipur Sadar', 'Sanganer', 'Amer', 'Chaksu', 'Bassai', 'Kotputli', 'Viratnagar', 'Phulera', 'Jamwa Ramgarh'] },
      { district: 'Jodhpur', talukas: ['Jodhpur City', 'Luni', 'Bilara', 'Bhopalgarh', 'Osian', 'Phalodi', 'Shergarh'] },
      { district: 'Udaipur', talukas: ['Girwa', 'Badgaon', 'Mavli', 'Vallabhnagar', 'Salumber', 'Kherwara', 'Kotra', 'Gogunda'] },
      { district: 'Kota', talukas: ['Kota Ladpura', 'Digod', 'Sangod', 'Pipalda', 'Ramganj Mandi'] },
      { district: 'Ajmer', talukas: ['Ajmer', 'Beawar', 'Kishangarh', 'Nasirabad', 'Kekri', 'Sarwar', 'Pisangan'] },
      { district: 'Bikaner', talukas: ['Bikaner', 'Nokha', 'Lunkaransar', 'Kolayat', 'Khajuwala', 'Dungargarh'] },
    ],
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      { district: 'Bhopal', talukas: ['Bhopal City', 'Huzur', 'Berasia', 'Kolar'] },
      { district: 'Indore', talukas: ['Indore City', 'Sanwer', 'Depalpur', 'Mhow (Dr. Ambedkar Nagar)', 'Hatod', 'Rau'] },
      { district: 'Jabalpur', talukas: ['Jabalpur Sadar', 'Sihora', 'Patan', 'Panagar', 'Kundam', 'Shahpura'] },
      { district: 'Gwalior', talukas: ['Gwalior City', 'Morar', 'Dabra', 'Bhitarwar', 'Chinour'] },
      { district: 'Ujjain', talukas: ['Ujjain City', 'Badnagar', 'Khachrod', 'Mahidpur', 'Tarana', 'Nagda'] },
    ],
  },
  {
    state: 'West Bengal',
    districts: [
      { district: 'Kolkata', talukas: ['Central Kolkata', 'North Kolkata', 'South Kolkata', 'Port Division', 'Alipore'] },
      { district: 'North 24 Parganas', talukas: ['Barasat', 'Barrackpore', 'Bidhannagar', 'Basirhat', 'Bangaon'] },
      { district: 'South 24 Parganas', talukas: ['Alipore Sadar', 'Baruipur', 'Canning', 'Diamond Harbour', 'Kakdwip'] },
      { district: 'Howrah', talukas: ['Howrah Sadar', 'Bally', 'Uluberia', 'Shyampur', 'Amta', 'Bagnan'] },
      { district: 'Darjeeling', talukas: ['Darjeeling Sadar', 'Kurseong', 'Mirik', 'Siliguri'] },
    ],
  },
  {
    state: 'Bihar',
    districts: [
      { district: 'Patna', talukas: ['Patna Sadar', 'Danapur', 'Barh', 'Masaurhi', 'Paliganj', 'Bakhtiarpur', 'Fatuha', 'Bikram', 'Phulwari Sharif'] },
      { district: 'Gaya', talukas: ['Gaya Sadar', 'Tekari', 'Sherghati', 'Neemchak Bathani', 'Wazirganj', 'Bodh Gaya'] },
      { district: 'Muzaffarpur', talukas: ['Muzaffarpur East', 'Muzaffarpur West', 'Kanti', 'Motipur', 'Sahebganj', 'Paroo'] },
      { district: 'Bhagalpur', talukas: ['Bhagalpur Sadar', 'Kahalgaon', 'Naugachhia', 'Sultanganj', 'Bihpur'] },
    ],
  },
  {
    state: 'Punjab',
    districts: [
      { district: 'Ludhiana', talukas: ['Ludhiana East', 'Ludhiana West', 'Jagraon', 'Khanna', 'Samrala', 'Payal', 'Raikot'] },
      { district: 'Amritsar', talukas: ['Amritsar-1', 'Amritsar-2', 'Ajnala', 'Baba Bakala', 'Majitha'] },
      { district: 'Jalandhar', talukas: ['Jalandhar-1', 'Jalandhar-2', 'Nakodar', 'Phillaur', 'Shahkot'] },
      { district: 'Patiala', talukas: ['Patiala', 'Nabha', 'Rajpura', 'Samana', 'Patran'] },
      { district: 'SAS Nagar (Mohali)', talukas: ['Mohali', 'Kharar', 'Dera Bassi'] },
    ],
  },
  {
    state: 'Haryana',
    districts: [
      { district: 'Gurugram', talukas: ['Gurugram Sadar', 'Badshahpur', 'Pataudi', 'Sohna', 'Manesar', 'Wazirabad'] },
      { district: 'Faridabad', talukas: ['Faridabad', 'Ballabgarh', 'Badkhal', 'Dhauj'] },
      { district: 'Panipat', talukas: ['Panipat', 'Samalkha', 'Israna', 'Bapoli'] },
      { district: 'Ambala', talukas: ['Ambala Cantt', 'Ambala City', 'Barara', 'Naraingarh', 'Saha'] },
      { district: 'Rohtak', talukas: ['Rohtak Sadar', 'Meham', 'Sampla', 'Kalanaur'] },
    ],
  },
  {
    state: 'Kerala',
    districts: [
      { district: 'Thiruvananthapuram', talukas: ['Thiruvananthapuram', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu', 'Varkala', 'Kattakada'] },
      { district: 'Ernakulam (Kochi)', talukas: ['Kanayannur (Kochi)', 'Kochi', 'Aluva', 'Paravur', 'Kunnathunad', 'Muvattupuzha', 'Kothamangalam'] },
      { district: 'Kozhikode', talukas: ['Kozhikode', 'Koyilandy', 'Vadakara', 'Thamarassery'] },
      { district: 'Thrissur', talukas: ['Thrissur', 'Mukundapuram', 'Chavakkad', 'Kodungallur', 'Talappilly', 'Chalakkudy'] },
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      { district: 'Visakhapatnam', talukas: ['Visakhapatnam Urban', 'Visakhapatnam Rural', 'Anakapalle', 'Bheemunipatnam', 'Gajuwaka', 'Pendurthi'] },
      { district: 'Vijayawada (NTR)', talukas: ['Vijayawada Urban', 'Vijayawada Rural', 'Mylavaram', 'Tiruvuru', 'Nandigama', 'Jaggayyapeta'] },
      { district: 'Guntur', talukas: ['Guntur East', 'Guntur West', 'Tenali', 'Mangalagiri', 'Prathipadu', 'Tadikonda'] },
      { district: 'Tirupati', talukas: ['Tirupati Urban', 'Tirupati Rural', 'Chandragiri', 'Srikalahasti', 'Sullurpeta', 'Gudur'] },
    ],
  },
  {
    state: 'Odisha',
    districts: [
      { district: 'Khordha (Bhubaneswar)', talukas: ['Bhubaneswar Sadar', 'Jatni', 'Khordha', 'Banapur', 'Begunia', 'Bolagarh', 'Chilika'] },
      { district: 'Cuttack', talukas: ['Cuttack Sadar', 'Baramba', 'Athagarh', 'Banki', 'Choudwar', 'Salepur', 'Nischintakoili'] },
      { district: 'Puri', talukas: ['Puri Sadar', 'Brahmagiri', 'Kakatpur', 'Nimapara', 'Pipili', 'Satyabadi', 'Gop'] },
    ],
  },
  {
    state: 'Assam',
    districts: [
      { district: 'Kamrup Metropolitan (Guwahati)', talukas: ['Guwahati Sadar', 'Dispur', 'Sonapur', 'Azara', 'Chandrapur'] },
      { district: 'Dibrugarh', talukas: ['Dibrugarh East', 'Dibrugarh West', 'Naharkatia', 'Chabua', 'Tingkhong', 'Moran'] },
      { district: 'Silchar (Cachar)', talukas: ['Silchar Sadar', 'Lakhipur', 'Sonai', 'Udarbond', 'Katigorah'] },
    ],
  },
  {
    state: 'Jammu and Kashmir',
    districts: [
      { district: 'Srinagar', talukas: ['Srinagar Central', 'Eidgah', 'Khanyar', 'Pantha Chowk', 'Shalteng', 'Chanapora'] },
      { district: 'Jammu', talukas: ['Jammu North', 'Jammu South', 'Bahu', 'R.S. Pura', 'Akhnoor', 'Bishnah', 'Marh'] },
      { district: 'Anantnag', talukas: ['Anantnag', 'Bijbehara', 'Dooru', 'Kokernag', 'Pahalgam', 'Shangus'] },
    ],
  },
  {
    state: 'Goa',
    districts: [
      { district: 'North Goa', talukas: ['Tiswadi (Panaji)', 'Bardez (Mapusa)', 'Pernem', 'Bicholim', 'Sattari'] },
      { district: 'South Goa', talukas: ['Salcete (Margao)', 'Mormugao (Vasco)', 'Ponda', 'Quepem', 'Sanguem', 'Canacona', 'Dharbandora'] },
    ],
  },
  {
    state: 'Uttarakhand',
    districts: [
      { district: 'Dehradun', talukas: ['Dehradun Sadar', 'Rishikesh', 'Vikasnagar', 'Chakrata', 'Kalsi', 'Tyuni', 'Doiwala'] },
      { district: 'Haridwar', talukas: ['Haridwar', 'Roorkee', 'Bhagwanpur', 'Laksar'] },
      { district: 'Nainital', talukas: ['Nainital', 'Haldwani', 'Ramnagar', 'Dhari', 'Betalghat', 'Kaladhungi'] },
    ],
  },
  {
    state: 'Jharkhand',
    districts: [
      { district: 'Ranchi', talukas: ['Ranchi Sadar', 'Kanke', 'Ormanjhi', 'Namkum', 'Ratu', 'Bundu', 'Mandar'] },
      { district: 'East Singhbhum (Jamshedpur)', talukas: ['Jamshedpur Sadar', 'Ghatshila', 'Potka', 'Patamda', 'Baharagora', 'Musabani'] },
      { district: 'Dhanbad', talukas: ['Dhanbad Sadar', 'Jharia', 'Baghmara', 'Nirsa', 'Tundi', 'Govindpur'] },
    ],
  },
  {
    state: 'Chhattisgarh',
    districts: [
      { district: 'Raipur', talukas: ['Raipur Sadar', 'Arang', 'Abhanpur', 'Tilda Newra', 'Dharsiwa'] },
      { district: 'Durg (Bhilai)', talukas: ['Durg Sadar', 'Bhilai', 'Patan', 'Dhamdha'] },
      { district: 'Bilaspur', talukas: ['Bilaspur Sadar', 'Kota', 'Takhatpur', 'Masturi', 'Bilha'] },
    ],
  },
  {
    state: 'Himachal Pradesh',
    districts: [
      { district: 'Shimla', talukas: ['Shimla Urban', 'Shimla Rural', 'Theog', 'Rampur', 'Rohru', 'Chopal', 'Kotkhai'] },
      { district: 'Kangra (Dharamshala)', talukas: ['Dharamshala', 'Kangra', 'Palampur', 'Nurpur', 'Dehra Gopipur', 'Baijnath'] },
    ],
  },
  {
    state: 'Chandigarh',
    districts: [
      { district: 'Chandigarh', talukas: ['Central Sub-Division', 'East Sub-Division', 'South Sub-Division'] },
    ],
  },
  {
    state: 'Puducherry',
    districts: [
      { district: 'Puducherry', talukas: ['Puducherry', 'Oulgaret', 'Villianur', 'Bahour'] },
      { district: 'Karaikal', talukas: ['Karaikal', 'Nedungadu', 'Kottucherry', 'Tirunallar'] },
    ],
  },
  {
    state: 'Ladakh',
    districts: [
      { district: 'Leh', talukas: ['Leh Sadar', 'Khaltsi', 'Nubra', 'Nyoma', 'Durbuk'] },
      { district: 'Kargil', talukas: ['Kargil', 'Zanskar', 'Sankoo', 'Drass', 'Shakar Chiktan'] },
    ],
  },
  {
    state: 'Arunachal Pradesh',
    districts: [
      { district: 'Papum Pare (Itanagar)', talukas: ['Itanagar', 'Naharlagun', 'Doimukh', 'Sagalee', 'Kimin'] },
      { district: 'Changlang', talukas: ['Changlang', 'Miao', 'Jairampur', 'Bordumsa'] },
    ],
  },
  {
    state: 'Manipur',
    districts: [
      { district: 'Imphal West', talukas: ['Lamphelpat', 'Patsoi', 'Lamsang', 'Wangoi'] },
      { district: 'Imphal East', talukas: ['Porompat', 'Sawombung', 'Keirao Bitra'] },
    ],
  },
  {
    state: 'Meghalaya',
    districts: [
      { district: 'East Khasi Hills (Shillong)', talukas: ['Shillong Sadar', 'Mylliem', 'Mawphlang', 'Sohra (Cherrapunji)', 'Pynursla'] },
      { district: 'West Garo Hills (Tura)', talukas: ['Tura', 'Dalu', 'Dadenggre', 'Rongram'] },
    ],
  },
  {
    state: 'Mizoram',
    districts: [
      { district: 'Aizawl', talukas: ['Aizawl Sadar', 'Tlangnuam', 'Darlawn', 'Thingsulthliah'] },
      { district: 'Lunglei', talukas: ['Lunglei', 'Hnahthial', 'Tlabung'] },
    ],
  },
  {
    state: 'Nagaland',
    districts: [
      { district: 'Kohima', talukas: ['Kohima Sadar', 'Sechu Zubza', 'Chiephobozou', 'Jakhama', 'Tseminyu'] },
      { district: 'Dimapur', talukas: ['Dimapur Sadar', 'Chumoukedima', 'Medziphema', 'Niuland'] },
    ],
  },
  {
    state: 'Sikkim',
    districts: [
      { district: 'Gangtok (East Sikkim)', talukas: ['Gangtok', 'Pakyong', 'Rongli'] },
      { district: 'Namchi (South Sikkim)', talukas: ['Namchi', 'Ravangla', 'Jorethang'] },
    ],
  },
  {
    state: 'Tripura',
    districts: [
      { district: 'West Tripura (Agartala)', talukas: ['Agartala Sadar', 'Mohanpur', 'Jirania', 'Dukli'] },
      { district: 'Gomati (Udaipur)', talukas: ['Udaipur', 'Amarpur', 'Karbook'] },
    ],
  },
  {
    state: 'Andaman and Nicobar Islands',
    districts: [
      { district: 'South Andaman (Port Blair)', talukas: ['Port Blair', 'Ferrargunj', 'Little Andaman'] },
      { district: 'North and Middle Andaman', talukas: ['Mayabunder', 'Diglipur', 'Rangat'] },
    ],
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: [
      { district: 'Daman', talukas: ['Daman Sadar', 'Nani Daman', 'Moti Daman'] },
      { district: 'Diu', talukas: ['Diu Sadar', 'Ghoghla'] },
      { district: 'Dadra and Nagar Haveli', talukas: ['Silvassa', 'Khanvel'] },
    ],
  },
  {
    state: 'Lakshadweep',
    districts: [
      { district: 'Lakshadweep (Kavaratti)', talukas: ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy'] },
    ],
  },
];

// Helper to get all state names sorted
export const getStateNames = (): string[] => {
  return ALL_INDIAN_STATES.map((s) => s.state).sort((a, b) => a.localeCompare(b));
};

// Helper to get districts for a selected state
export const getDistrictsForState = (stateName: string): string[] => {
  const found = ALL_INDIAN_STATES.find((s) => s.state.toLowerCase() === stateName.toLowerCase());
  if (!found) return ['Central District', 'North District', 'South District', 'East District', 'West District'];
  return found.districts.map((d) => d.district);
};

// Helper to get talukas for a selected state and district
export const getTalukasForDistrict = (stateName: string, districtName: string): string[] => {
  const foundState = ALL_INDIAN_STATES.find((s) => s.state.toLowerCase() === stateName.toLowerCase());
  if (!foundState) {
    return ['Sadar Taluka', 'North Taluka', 'South Taluka', 'East Taluka', 'West Taluka', 'Rural Taluka'];
  }
  const foundDist = foundState.districts.find(
    (d) => d.district.toLowerCase() === districtName.toLowerCase()
  );
  if (!foundDist || foundDist.talukas.length === 0) {
    return [
      `${districtName} City / Sadar`,
      `${districtName} North`,
      `${districtName} South`,
      `${districtName} East`,
      `${districtName} West`,
      `${districtName} Rural`,
    ];
  }
  return foundDist.talukas;
};
