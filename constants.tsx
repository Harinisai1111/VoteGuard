
import { UserRole, Voter, User, AuditLog, OtherIDMetadata } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Ramesh Kumar', role: UserRole.ELECTION_OFFICER, district: 'Central Delhi' },
  { id: 'u2', name: 'Suresh Patel', role: UserRole.FIELD_OFFICER, district: 'Central Delhi' },
  { id: 'u3', name: 'Anjali Sharma', role: UserRole.ADMIN, district: 'N/A' },
  { id: 'u4', name: 'M.C. Hyderabad Office', role: UserRole.MUNICIPAL_OFFICER, district: 'Hyderabad' },
];

const generateVoters = (): Voter[] => {
  const voters: Voter[] = [];
  const geoMatrix = [
    { zone: 'South', states: ['Tamil Nadu', 'Karnataka', 'Kerala', 'Telangana', 'Andhra Pradesh'] },
    { zone: 'North', states: ['Delhi', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand'] },
    { zone: 'West', states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'] },
    { zone: 'East', states: ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand'] },
    { zone: 'Central', states: ['Madhya Pradesh', 'Chhattisgarh', 'Uttar Pradesh'] },
    { zone: 'North-East', states: ['Assam', 'Manipur', 'Sikkim', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Tripura', 'Mizoram'] }
  ];

  const firstNames = ['Vijay', 'Karthik', 'Sanjay', 'Arjun', 'Rahul', 'Amit', 'Priya', 'Sneha', 'Meena', 'Ananya', 'Rohan', 'Deepak', 'Suresh', 'Ramesh', 'Laxmi', 'Geeta', 'Mohan', 'Kavita', 'Rajesh', 'Sunita'];
  const lastNames = ['Kumar', 'Nair', 'Iyer', 'Reddy', 'Sharma', 'Gupta', 'Singh', 'Patel', 'Das', 'Rao', 'Varma', 'Jadhav', 'Pillai', 'Goud', 'Banerjee', 'Chatterjee', 'Kulkarni', 'Deshmukh', 'Tyagi', 'Bose'];
  const idTypes: OtherIDMetadata['type'][] = ['Passport', 'PAN', 'Driving License', 'NPR'];

  let count = 0;

  geoMatrix.forEach(geo => {
    geo.states.forEach(state => {
      for (let i = 0; i < 7; i++) {
        count++;
        const name = `${firstNames[count % firstNames.length]} ${lastNames[count % lastNames.length]}`;
        const yob = 1955 + (count % 50);
        const age = 2024 - yob;
        
        const hasAadhaar = true; // Most voters have Aadhaar
        const hasSecondaryID = Math.random() > 0.4; 
        const isFlaggedProb = Math.random() > 0.92;
        const riskScore = isFlaggedProb ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 20);

        const reasons = [];
        if (isFlaggedProb) reasons.push('Minor metadata inconsistency detected');

        voters.push({
          id: `VOT-${300000 + count}`,
          name: name.toUpperCase(),
          age: age,
          dob: `${yob}-0${(count % 9) + 1}-10`,
          address: `Block ${i + 1}, Sector ${count % 15}, ${state}`,
          state: state,
          zone: geo.zone,
          district: `${state} District ${Math.floor(count / 10) + 1}`,
          pollingStation: `Booth-${200 + i}, ${state} High School`,
          lastVerifiedYear: 2018 + (count % 6),
          riskScore: riskScore,
          status: riskScore > 75 ? 'Pending Verification' : 'Active',
          isFlagged: isFlaggedProb,
          flaggedReasons: reasons,
          isArchived: false,
          aadhaarMeta: {
            initials: name.split(' ').map(n => n[0]).join(''),
            yob: yob,
            stateCode: state.substring(0, 2).toUpperCase(),
            lastUpdatedYear: 2021 + (count % 3),
            syncRevision: (count % 2) + 1,
            consistencyStatus: 'CONSISTENT',
            aadhaarIdHash: `HASH-${2000 + count}`
          },
          otherIdMeta: hasSecondaryID ? {
            type: idTypes[count % idTypes.length],
            idNumber: `SEC-${90000 + count}`,
            nameOnId: name.toUpperCase(),
            dobOnId: `${yob}-0${(count % 9) + 1}-10`
          } : undefined
        });
      }
    });
  });

  // Specific Clash Case
  voters.push({
    id: 'EPIC-DUP-X1',
    name: 'RAJESH KHANNA',
    age: 55,
    dob: '1969-05-12',
    address: 'Plot 42, Civil Lines, Nagpur, Maharashtra',
    state: 'Maharashtra',
    zone: 'West',
    district: 'Nagpur',
    pollingStation: 'PS-88, Nagpur Central',
    lastVerifiedYear: 2023,
    riskScore: 99,
    status: 'Pending Verification',
    isFlagged: true,
    flaggedReasons: ['Identity overlap detected'],
    isArchived: false,
    aadhaarMeta: { initials: 'RK', yob: 1969, stateCode: 'MH', lastUpdatedYear: 2023, syncRevision: 1, consistencyStatus: 'CONSISTENT', aadhaarIdHash: 'HID-RAJESH-CLASH' },
  });

  voters.push({
    id: 'EPIC-DUP-X2',
    name: 'RAJESH KHANNA',
    age: 55,
    dob: '1969-05-12',
    address: 'Sector 5, Dwarka, Delhi',
    state: 'Delhi',
    zone: 'North',
    district: 'New Delhi',
    pollingStation: 'PS-12, Dwarka',
    lastVerifiedYear: 2022,
    riskScore: 99,
    status: 'Pending Verification',
    isFlagged: true,
    flaggedReasons: ['Identity overlap detected'],
    isArchived: false,
    aadhaarMeta: { initials: 'RK', yob: 1969, stateCode: 'DL', lastUpdatedYear: 2023, syncRevision: 1, consistencyStatus: 'CONSISTENT', aadhaarIdHash: 'HID-RAJESH-CLASH' },
    otherIdMeta: { type: 'Passport', idNumber: 'P-998877', nameOnId: 'RAJESH KHANNA', dobOnId: '1969-05-12' }
  });

  return voters;
};

export const MOCK_VOTERS: Voter[] = generateVoters();

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', timestamp: '2024-05-10T10:30:00Z', userId: 'u1', userName: 'Dr. Ramesh Kumar', action: 'Identity Check', details: 'Cross-node Aadhaar verification completed for cluster HID-RAJESH-CLASH.' },
  { id: 'l2', timestamp: '2024-05-11T14:20:00Z', userId: 'u3', userName: 'Anjali Sharma', action: 'System Audit', details: 'Identity resolution logic updated: Aadhaar verified records do not require secondary ID.' },
];
