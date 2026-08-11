// services/taxCalculator.js

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/**
 * India - New Tax Regime
 *
 * Applicable for FY 2026-27 / Tax Year 2026-27
 *
 * Handles ordinary slab-rate income.
 * Special-rate income such as certain capital gains is NOT included.
 */
function calculateIndiaNewRegime(taxableIncome, isResident = true) {
  let incomeTax = 0;

  if (taxableIncome <= 400000) {
    incomeTax = 0;
  } else if (taxableIncome <= 800000) {
    incomeTax = (taxableIncome - 400000) * 0.05;
  } else if (taxableIncome <= 1200000) {
    incomeTax = 20000 + (taxableIncome - 800000) * 0.10;
  } else if (taxableIncome <= 1600000) {
    incomeTax = 60000 + (taxableIncome - 1200000) * 0.15;
  } else if (taxableIncome <= 2000000) {
    incomeTax = 120000 + (taxableIncome - 1600000) * 0.20;
  } else if (taxableIncome <= 2400000) {
    incomeTax = 200000 + (taxableIncome - 2000000) * 0.25;
  } else {
    incomeTax = 300000 + (taxableIncome - 2400000) * 0.30;
  }

  /*
   * Section 87A rebate:
   * Resident individual with taxable income <= ₹12,00,000
   * can receive rebate up to ₹60,000.
   */
  let rebate = 0;

  if (isResident && taxableIncome <= 1200000) {
    rebate = Math.min(incomeTax, 60000);
  }

  let taxAfterRebate = Math.max(incomeTax - rebate, 0);

  /*
   * Marginal relief around the ₹12 lakh rebate threshold.
   *
   * For income slightly above ₹12 lakh, tax should not exceed
   * the amount by which income exceeds ₹12 lakh.
   */
  let marginalRelief = 0;

  if (isResident && taxableIncome > 1200000 && taxableIncome <= 1275000) {
    const excessIncome = taxableIncome - 1200000;

    if (taxAfterRebate > excessIncome) {
      marginalRelief = taxAfterRebate - excessIncome;
      taxAfterRebate = excessIncome;
    }
  }

  /*
   * Surcharge under the new regime:
   * > ₹50 lakh to ₹1 crore   -> 10%
   * > ₹1 crore to ₹2 crore   -> 15%
   * > ₹2 crore                -> 25%
   *
   * Marginal relief is handled separately below.
   */
  let surchargeRate = 0;

  if (taxableIncome > 20000000) {
    surchargeRate = 0.25;
  } else if (taxableIncome > 10000000) {
    surchargeRate = 0.15;
  } else if (taxableIncome > 5000000) {
    surchargeRate = 0.10;
  }

  let surcharge = taxAfterRebate * surchargeRate;

  /*
   * Basic marginal-relief handling for surcharge thresholds.
   *
   * This prevents the tax + surcharge from increasing by more
   * than the income above the applicable threshold.
   */
  if (surchargeRate > 0) {
    const threshold =
      taxableIncome > 20000000
        ? 20000000
        : taxableIncome > 10000000
          ? 10000000
          : 5000000;

    const taxAtThreshold = calculateIndiaNewRegime(
      threshold,
      isResident
    );

    const taxWithSurcharge = taxAfterRebate + surcharge;

    if (taxWithSurcharge > taxAtThreshold.totalTax + (taxableIncome - threshold)) {
      const allowedTax =
        taxAtThreshold.totalTax + (taxableIncome - threshold);

      surcharge = Math.max(allowedTax - taxAfterRebate, 0);
    }
  }

  const taxBeforeCess = taxAfterRebate + surcharge;

  // Health & Education Cess = 4%
  const cess = taxBeforeCess * 0.04;

  const totalTax = taxBeforeCess + cess;

  return {
    regime: "India New Tax Regime",
    taxYear: "2026-27",
    taxableIncome: roundCurrency(taxableIncome),
    incomeTax: roundCurrency(incomeTax),
    rebate: roundCurrency(rebate),
    marginalRelief: roundCurrency(marginalRelief),
    surcharge: roundCurrency(surcharge),
    cess: roundCurrency(cess),
    totalTax: roundCurrency(totalTax),
    effectiveRate:
      taxableIncome > 0
        ? roundCurrency((totalTax / taxableIncome) * 100)
        : 0,
  };
}

/**
 * Main tax calculator.
 *
 * For now we deliberately support India only.
 * We will not show fake/obsolete calculations for other countries.
 */
export function calculateTax({
  region,
  annualIncome,
  deductions = 0,
  incomeType = "Other",
  isResident = true,
}) {
  const income = Number(annualIncome);
  const userDeductions = Number(deductions);

  if (!Number.isFinite(income) || income < 0) {
    throw new Error("Annual income must be a valid non-negative number.");
  }

  if (!Number.isFinite(userDeductions) || userDeductions < 0) {
    throw new Error("Deductions must be a valid non-negative number.");
  }

  if (userDeductions > income) {
    throw new Error("Deductions cannot exceed annual income.");
  }

  if (region !== "India") {
    throw new Error(
      "Tax estimation is currently available only for India. " +
      "Other countries will be enabled after their tax rules are verified."
    );
  }

  /*
   * ₹75,000 standard deduction for salaried taxpayers
   * under the new regime.
   *
   * It cannot exceed salary/income.
   */
  const standardDeduction =
    incomeType === "Salaried"
      ? Math.min(75000, income)
      : 0;

  const totalDeductions = Math.min(
    income,
    standardDeduction + userDeductions
  );

  const taxableIncome = Math.max(
    income - totalDeductions,
    0
  );

  const calculation = calculateIndiaNewRegime(
    taxableIncome,
    isResident
  );

  return {
    ...calculation,
    region: "India",
    annualIncome: roundCurrency(income),
    incomeType,
    standardDeduction: roundCurrency(standardDeduction),
    additionalDeductions: roundCurrency(userDeductions),
    totalDeductions: roundCurrency(totalDeductions),
    taxableIncome: roundCurrency(taxableIncome),
  };
}