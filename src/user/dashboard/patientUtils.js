export const VACCINE_CATALOG = [
    { key: 'rsv', name: 'Respiratory Syncytial Virus (RSV)', intervalDays: 3650, minAge: 0, maxAge: 1 },
    { key: 'dtap-ipv-hib', name: 'DTaP-IPV-Hib', intervalDays: 3650, minAge: 0 },
    { key: 'pneu-c-15', name: 'Pneumococcal Conjugate 15 valent (Pneu-C-15)', intervalDays: 3650, minAge: 0 },
    { key: 'rotavirus', name: 'Rotavirus', intervalDays: 3650, minAge: 0, maxAge: 1 },
    { key: 'mmrv', name: 'Measles, Mumps, Rubella, Varicella (MMRV)', intervalDays: 3650, minAge: 1 },
    { key: 'men-c-acyw', name: 'Meningococcal Conjugate Quadrivalent (Men-C-ACYW)', intervalDays: 3650, minAge: 1 },
    { key: 'tdap-ipv', name: 'Tdap-IPV', intervalDays: 3650, minAge: 4 },
    { key: 'influenza', name: 'Influenza (Flu)', intervalDays: 365, minAge: 0 }
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseSafeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
    const date = value instanceof Date ? value : parseSafeDate(value);
    if (!date) return '-';
    return date.toLocaleDateString();
}

export function calculateAge(dob) {
    const birth = parseSafeDate(dob);
    if (!birth) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? age : null;
}

function normalize(value) {
    return String(value || '').toLowerCase().trim();
}

function findLastRecord(records, vaccineName) {
    const target = normalize(vaccineName);
    return records
        .filter((record) => {
            const name = normalize(record?.vaccineName);
            return name.includes(target) || target.includes(name);
        })
        .sort((a, b) => parseSafeDate(b.dateTaken) - parseSafeDate(a.dateTaken))[0];
}

function isRiskEligible(profile, risk) {
    if (!risk) return true;
    if (risk === 'chronic') return Array.isArray(profile?.conditions) && profile.conditions.length > 0;
    if (risk === 'pregnancy') return Boolean(profile?.pregnancyStatus);
    if (risk === 'immunocompromised') return Boolean(profile?.immunocompromisedStatus);
    return true;
}

export function buildVaccineInsights(profile, reminderWindowDays = 14) {
    const age = calculateAge(profile?.dob);
    const records = (profile?.vaccinations || []).filter((item) => item?.vaccineName && parseSafeDate(item?.dateTaken));
    const today = new Date();

    const timeline = VACCINE_CATALOG.map((vaccine) => {
        const riskEligible = isRiskEligible(profile, vaccine.risk);
        const minAgeEligible = vaccine.minAge == null || (age != null && age >= vaccine.minAge);
        const maxAgeEligible = vaccine.maxAge == null || (age != null && age <= vaccine.maxAge);
        const eligible = riskEligible && minAgeEligible && maxAgeEligible;

        if (!eligible) {
            let reason = 'Eligibility criteria not met';
            if (!minAgeEligible) reason = `Eligible at age ${vaccine.minAge}+`;
            if (!maxAgeEligible) reason = `Recommended until age ${vaccine.maxAge}`;
            if (!riskEligible) reason = `Recommended for ${vaccine.risk} risk group`;

            return {
                key: vaccine.key,
                vaccineName: vaccine.name,
                status: 'not_eligible',
                reason,
                dueDate: null,
                lastDate: null,
                sortDate: null
            };
        }

        const last = findLastRecord(records, vaccine.name);
        const lastDate = parseSafeDate(last?.dateTaken);

        if (!lastDate) {
            return {
                key: vaccine.key,
                vaccineName: vaccine.name,
                status: 'due_soon',
                reason: 'No record found, vaccine recommended now',
                dueDate: today,
                lastDate: null,
                sortDate: today
            };
        }

        const dueDate = new Date(lastDate.getTime() + vaccine.intervalDays * DAY_MS);
        const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / DAY_MS);

        let status = 'completed';
        let reason = 'Up to date';
        if (daysToDue < 0) {
            status = 'overdue';
            reason = `${Math.abs(daysToDue)} day(s) overdue`;
        } else if (daysToDue <= reminderWindowDays) {
            status = 'due_soon';
            reason = `Due in ${daysToDue} day(s)`;
        }

        return {
            key: vaccine.key,
            vaccineName: vaccine.name,
            status,
            reason,
            dueDate,
            lastDate,
            sortDate: status === 'completed' ? lastDate : dueDate
        };
    });

    const completedCount = timeline.filter((item) => item.status === 'completed').length;
    const dueSoonCount = timeline.filter((item) => item.status === 'due_soon').length;
    const overdueCount = timeline.filter((item) => item.status === 'overdue').length;
    const notEligibleCount = timeline.filter((item) => item.status === 'not_eligible').length;

    const nextScheduled = timeline
        .filter((item) => item.status !== 'not_eligible' && item.dueDate)
        .sort((a, b) => a.dueDate - b.dueDate)[0];

    const totalTrackable = completedCount + dueSoonCount + overdueCount;
    const protectionScore = Math.round((completedCount / Math.max(totalTrackable, 1)) * 100);

    const eligibleNow = timeline.filter((item) => item.status === 'due_soon' || item.status === 'overdue');
    const eligibleSoon = timeline.filter((item) => item.status === 'completed' && item.dueDate && (item.dueDate - today) / DAY_MS <= 90);
    const notEligible = timeline.filter((item) => item.status === 'not_eligible');

    return {
        age,
        timeline: timeline.sort((a, b) => {
            const left = a.sortDate ? a.sortDate.getTime() : Number.MAX_SAFE_INTEGER;
            const right = b.sortDate ? b.sortDate.getTime() : Number.MAX_SAFE_INTEGER;
            return left - right;
        }),
        summary: {
            completedCount,
            dueSoonCount,
            overdueCount,
            notEligibleCount,
            nextScheduledName: nextScheduled?.vaccineName || '-',
            nextScheduledDate: nextScheduled?.dueDate || null,
            protectionScore
        },
        eligibility: {
            eligibleNow,
            eligibleSoon,
            notEligible
        }
    };
}
