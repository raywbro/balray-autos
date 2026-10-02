"use client";

import { useState } from "react";

type Props = {
  price: number;
  priceFormatted: string;
};

export default function FinancingCalculator({ price, priceFormatted }: Props) {
  const [depositPercent, setDepositPercent] = useState(10);
  const [termMonths, setTermMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(11.75);

  const deposit = (price * depositPercent) / 100;
  const loanAmount = price - deposit;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths;
  const totalPaid = monthlyPayment * termMonths + deposit;
  const totalInterest = totalPaid - price;
  const monthlyPaymentFormatted = `R${Math.round(monthlyPayment).toLocaleString()}`;
  const depositFormatted = `R${Math.round(deposit).toLocaleString()}`;
  const totalPaidFormatted = `R${Math.round(totalPaid).toLocaleString()}`;
  const totalInterestFormatted = `R${Math.round(totalInterest).toLocaleString()}`;

  const preApprovalMessage = encodeURIComponent(
    `Hi Balray Autos! I'm interested in a vehicle listed at ${priceFormatted}.\n\nFinancing options I'm looking at:\n- Deposit: ${depositFormatted}\n- Term: ${termMonths} months\n- Estimated monthly: ${monthlyPaymentFormatted}\n\nCan you help me get pre-approved?`
  );
  const preApprovalUrl = `https://wa.me/27815973009?text=${preApprovalMessage}`;

  return (
    <div className="rounded-2xl border border-[#D5DBDF] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8F7130] to-[#B08D3C] text-lg text-white">
          💳
        </div>
        <div>
          <h3 className="text-lg font-black text-[#34414A]">Financing Calculator</h3>
          <p className="text-xs text-[#89939A]">Estimate your monthly payment</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[#34414A]">Deposit</label>
          <span className="text-sm font-black text-[#8F7130]">
            {depositPercent}% ({depositFormatted})
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={depositPercent}
          onChange={(e) => setDepositPercent(Number(e.target.value))}
          className="mt-2 w-full accent-[#B08D3C]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#89939A]">
          <span>0%</span>
          <span>50%</span>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-bold text-[#34414A]">Term</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[12, 24, 36, 48, 60, 72].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTermMonths(months)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                termMonths === months
                  ? "border-[#B08D3C] bg-[#B08D3C] text-white"
                  : "border-[#D5DBDF] bg-white text-[#34414A] hover:border-[#B08D3C]"
              }`}
            >
              {months} mo
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[#34414A]">Interest Rate (annual)</label>
          <span className="text-sm font-black text-[#8F7130]">
            {interestRate.toFixed(2)}%
          </span>
        </div>
        <input
          type="range"
          min="7"
          max="20"
          step="0.25"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="mt-2 w-full accent-[#B08D3C]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#89939A]">
          <span>7%</span>
          <span>20%</span>
        </div>
      </div>

      <div className="mt-6 space-y-3 rounded-xl bg-[#F7F8F9] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#66737C]">Vehicle Price</span>
          <span className="font-bold text-[#34414A]">{priceFormatted}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#66737C]">Deposit</span>
          <span className="font-bold text-[#34414A]">- {depositFormatted}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#66737C]">Amount Financed</span>
          <span className="font-bold text-[#34414A]">
            R{Math.round(loanAmount).toLocaleString()}
          </span>
        </div>
        <div className="border-t border-[#E1E5E8] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#34414A]">Monthly Payment</span>
            <span className="text-2xl font-black text-[#8F7130]">{monthlyPaymentFormatted}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#89939A]">Total Interest Paid</span>
          <span className="font-bold text-[#89939A]">{totalInterestFormatted}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#89939A]">Total Amount Paid</span>
          <span className="font-bold text-[#89939A]">{totalPaidFormatted}</span>
        </div>
      </div>

      <a
        href={preApprovalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block w-full rounded-xl bg-gradient-to-r from-[#8F7130] via-[#B08D3C] to-[#A47F32] px-6 py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105"
      >
        💬 Get Pre-Approved
      </a>

      <p className="mt-3 text-center text-xs leading-5 text-[#89939A]">
        ⓘ Estimate only. Actual rates depend on your credit profile and lender terms.
      </p>
    </div>
  );
}