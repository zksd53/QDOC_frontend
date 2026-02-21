const clinicPatients = [
    {
        id: 'P-1001',
        name: 'Aarav Sharma',
        age: 6,
        riskStatus: 'Low',
        dueVaccine: 'MMRV Booster',
        currentStatus: 'Due This Week',
        lastDoseDate: '2025-08-12',
        timeline: ['DTaP-IPV-Hib', 'Pneu-C-15', 'MMRV'],
        eligibility: 'Eligible now due to age and schedule interval',
        ruleBreakdown: 'Routine pediatric schedule at age 4-6',
        riskFactors: 'None'
    },
    {
        id: 'P-1002',
        name: 'Emma Patel',
        age: 64,
        riskStatus: 'Medium',
        dueVaccine: 'Influenza',
        currentStatus: 'Overdue',
        lastDoseDate: '2024-01-22',
        timeline: ['Tdap', 'COVID Booster', 'Influenza'],
        eligibility: 'Eligible now due to annual flu recommendation',
        ruleBreakdown: 'Adult seasonal immunization rule',
        riskFactors: 'Chronic respiratory condition'
    },
    {
        id: 'P-1003',
        name: 'Noah Singh',
        age: 33,
        riskStatus: 'High',
        dueVaccine: 'Hepatitis B',
        currentStatus: 'Due This Week',
        lastDoseDate: '2022-09-19',
        timeline: ['COVID Booster', 'Tdap'],
        eligibility: 'Eligible now due to risk-based recommendation',
        ruleBreakdown: 'Risk-triggered booster cadence',
        riskFactors: 'Immunocompromised'
    },
    {
        id: 'P-1004',
        name: 'Mia Fernandes',
        age: 27,
        riskStatus: 'Medium',
        dueVaccine: 'Tdap Booster',
        currentStatus: 'Completed',
        lastDoseDate: '2026-01-03',
        timeline: ['Tdap', 'Influenza', 'HPV'],
        eligibility: 'Not due now, next window in 10 years',
        ruleBreakdown: 'Tdap interval schedule',
        riskFactors: 'Pregnancy status monitored'
    }
];

export default clinicPatients;
