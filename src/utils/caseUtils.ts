import { User, Case } from '../types';

/**
 * Checks if a given user is assigned or connected to a specific case.
 * - DSP: Supervises all cases in the portal.
 * - Host: Assigned as the host for the case.
 * - Police Officer: Included in assignedOfficerIds or assignedOfficerNames.
 * - Advocate: Included in assignedAdvocateIds or assignedAdvocateNames.
 */
export function isUserAssignedToCase(user: User | null | undefined, c: Case | null | undefined): boolean {
  if (!user || !c) return false;

  // DSP role oversees all cases in the portal/precinct
  if (user.role === 'DSP') return true;

  // Host role assignment
  if (user.role === 'Host') {
    if (c.assignedHostId && c.assignedHostId === user.id) return true;
    if (
      c.assignedHostName &&
      c.assignedHostName !== 'Unassigned' &&
      c.assignedHostName.toLowerCase().includes(user.fullName.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // Police Officer role assignment
  if (user.role === 'Police Officer') {
    if (Array.isArray(c.assignedOfficerIds) && c.assignedOfficerIds.includes(user.id)) return true;
    if (
      Array.isArray(c.assignedOfficerNames) &&
      c.assignedOfficerNames.some(
        (name) => name && name.toLowerCase().includes(user.fullName.toLowerCase())
      )
    ) {
      return true;
    }
    return false;
  }

  // Victim role assignment
  if (user.role === 'Victim') {
    if (Array.isArray(user.assignedCases) && user.assignedCases.includes(c.id)) return true;
    if (c.victimId && c.victimId === user.id) return true;
    if (c.victimUsername && c.victimUsername.toLowerCase() === user.username.toLowerCase()) return true;
    if (c.victimName && (
      c.victimName.toLowerCase().includes(user.fullName.toLowerCase()) ||
      user.fullName.toLowerCase().includes(c.victimName.toLowerCase())
    )) {
      return true;
    }
    return false;
  }

  // Advocate role assignment
  if (user.role === 'Advocate') {
    if (Array.isArray(c.assignedAdvocateIds) && c.assignedAdvocateIds.includes(user.id)) return true;
    if (
      Array.isArray(c.assignedAdvocateNames) &&
      c.assignedAdvocateNames.some(
        (name) => name && name.toLowerCase().includes(user.fullName.toLowerCase())
      )
    ) {
      return true;
    }
    return false;
  }

  // Subdivision Level role assignment
  if (user.role === 'Subdivision Level') {
    if (c.assignedSubdivisionOfficerId && c.assignedSubdivisionOfficerId === user.id) return true;
    if (
      c.assignedSubdivisionOfficerName &&
      c.assignedSubdivisionOfficerName.toLowerCase().includes(user.fullName.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // District Level role assignment (Assigned in updating mode)
  if (user.role === 'District Level') {
    if (c.assignedDistrictOfficerId && c.assignedDistrictOfficerId === user.id) return true;
    if (
      c.assignedDistrictOfficerName &&
      c.assignedDistrictOfficerName.toLowerCase().includes(user.fullName.toLowerCase())
    ) {
      return true;
    }
    const userDistrict = (user.district || '').toLowerCase().replace(' district', '').trim();
    const caseDistrict = (c.district || getDistrictForTaluka(c.taluka || c.subdivisionTaluka)).toLowerCase().replace(' district', '').trim();
    if (userDistrict && caseDistrict && (userDistrict === caseDistrict || userDistrict.includes(caseDistrict) || caseDistrict.includes(userDistrict))) {
      return true;
    }
    return false;
  }

  return false;
}

/**
 * Returns the District name for a given Taluka
 */
export function getDistrictForTaluka(taluka?: string): string {
  if (!taluka) return 'Solapur';
  const t = taluka.toLowerCase().trim();
  const solapurTalukas = [
    'karmala', 'barshi', 'madha', 'pandharpur', 'sangola', 'malshiras', 'mohol',
    'mangavledha', 'mangalwedha', 'akkalkot', 'north solapur', 'south solapur', 'solapur'
  ];
  if (solapurTalukas.includes(t)) {
    return 'Solapur';
  }
  const jalnaTalukas = ['jalna', 'ambad', 'bhokardan', 'jafrabad', 'partur', 'ghansawangi', 'mantha', 'badnapur'];
  if (jalnaTalukas.includes(t)) {
    return 'Jalna';
  }
  const kolhapurTalukas = [
    'karvir', 'panhala', 'hatkanangle', 'shirol', 'kagal', 'gadhinglaj',
    'radhanagari', 'bhadarghat', 'ajra', 'chandgad', 'shahuwadi', 'gaganbawda', 'kolhapur'
  ];
  if (kolhapurTalukas.includes(t)) {
    return 'Kolhapur';
  }
  const puneTalukas = [
    'maval', 'haveli', 'pune', 'khed', 'shirur', 'baramati', 'indapur',
    'daund', 'bhor', 'velhe', 'purandar', 'mulshi', 'junnar', 'ambegaon'
  ];
  if (puneTalukas.includes(t)) {
    return 'Pune';
  }
  return 'Solapur';
}

/**
 * Returns District Officer representation for a given District
 */
export function getDistrictOfficerForDistrict(districtName: string, usersList?: User[]): {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  district: string;
} {
  const normDist = districtName.toLowerCase().replace(' district', '').trim();
  if (Array.isArray(usersList) && usersList.length > 0) {
    const found = usersList.find(
      (u) =>
        u.role === 'District Level' &&
        u.district &&
        u.district.toLowerCase().replace(' district', '').trim() === normDist
    );
    if (found) {
      return {
        id: found.id,
        fullName: found.fullName,
        designation: found.designation || 'District Magistrate & Collector / SP',
        department: found.department || `District Police Headquarters - ${districtName}`,
        district: districtName,
      };
    }
  }

  // Pre-configured District Level officers matching mockData
  if (normDist === 'jalna') {
    return {
      id: 'u-district-2',
      fullName: 'Dr. Shrikant Jivtode, IPS',
      designation: 'Superintendent of Police (SP)',
      department: 'District Police Headquarters - Jalna',
      district: 'Jalna',
    };
  }
  if (normDist === 'kolhapur') {
    return {
      id: 'u-district-3',
      fullName: 'Smt. Rekha Sharma, IAS',
      designation: 'District Magistrate & Collector',
      department: 'District Administration & Police HQ - Kolhapur',
      district: 'Kolhapur',
    };
  }
  // Default Solapur (for Karmala, Barshi, Madha)
  return {
    id: 'u-district-1',
    fullName: 'Shri Rajesh Deshmukh, IAS',
    designation: 'District Magistrate & Collector',
    department: 'District Administration & Police HQ - Solapur',
    district: 'Solapur',
  };
}

/**
 * Checks whether a case belongs to any of the talukas allotted to the officer
 */
export function isCaseInOfficerTalukas(user: User | null | undefined, c: Case | null | undefined): boolean {
  if (!user || !c) return false;
  const userTalukas: string[] = [];
  if (Array.isArray(user.talukas) && user.talukas.length > 0) {
    userTalukas.push(...user.talukas);
  }
  if (user.taluka && typeof user.taluka === 'string') {
    const single = user.taluka.trim();
    if (single && !userTalukas.some((t) => t.toLowerCase() === single.toLowerCase())) {
      userTalukas.push(single);
    }
  }
  if (userTalukas.length === 0) {
    if (user.role === 'Subdivision Level') {
      userTalukas.push('Karmala', 'Barshi', 'Madha');
    } else if (user.role === 'DSP') {
      userTalukas.push('Karmala');
    }
  }
  if (userTalukas.length === 0) return false;

  const caseTaluka = (c.taluka || '').toLowerCase().trim();
  const subdivTaluka = (c.subdivisionTaluka || '').toLowerCase().trim();
  const caseLoc = (c.location || '').toLowerCase();

  return userTalukas.some((t) => {
    const tl = t.toLowerCase().trim();
    if (!tl) return false;
    if (caseTaluka && (caseTaluka === tl || caseTaluka.includes(tl) || tl.includes(caseTaluka))) return true;
    if (subdivTaluka && (subdivTaluka === tl || subdivTaluka.includes(tl) || tl.includes(subdivTaluka))) return true;
    if (caseLoc.includes(tl)) return true;
    return false;
  });
}

/**
 * Maps role identifiers to official user-facing designations.
 * - 'DSP' -> 'SHO/Inspector'
 * - 'Host' -> 'Investigator'
 */
export function getRoleDisplayName(role?: string): string {
  if (!role) return '';
  if (role === 'DSP') return 'SHO/Inspector';
  if (role === 'Host') return 'Investigator';
  return role;
}

