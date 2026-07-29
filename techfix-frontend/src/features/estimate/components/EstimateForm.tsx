"use client";

import { useState } from "react";
import { useEstimate } from "@/features/estimate/hooks/useEstimate";

const BRANDS = ["Apple", "Samsung", "Google", "OnePlus", "Other"];
const ISSUES = ["Cracked Screen", "Battery Issue", "Water Damage", "Charging Port", "Camera Issue", "Other"];
const STEPS = ["Device", "Issue", "Location"] as const;

/**
 * 3-step "Get a Free Repair Estimate" form — feature UI only.
 * Progress indicator + one step per screen (Miller's Law / Zeigarnik Effect).
 */
export default function EstimateForm() {
  const { isLoading, error, submit } = useEstimate();
  const [step, setStep] = useState(0);

  const [brand, setBrand] = useState(BRANDS[0]);
  const [deviceModel, setDeviceModel] = useState("");
  const [issueType, setIssueType] = useState(ISSUES[0]);
  const [city, setCity] = useState("Kathmandu");

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    await submit({ brand, deviceModel, issueType, city });
  }

  return (
    <section className="estimate-form" aria-labelledby="estimate-form-heading">
      <div className="estimate-form__stack">
        <div className="estimate-form__head">
          <h1 id="estimate-form-heading" className="estimate-form__title">
            Get a Free Repair Estimate
          </h1>
          <p className="estimate-form__subtitle">
            Tell us about your device and we&apos;ll show you estimated repair costs from
            certified shops near you.
          </p>
        </div>

        {/* Progress */}
        <div className="estimate-form__progress">
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div className="estimate-form__progress-step">
                <div
                  className={`estimate-form__progress-circle ${
                    i < step
                      ? "estimate-form__progress-circle--done"
                      : i === step
                        ? "estimate-form__progress-circle--active"
                        : ""
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`estimate-form__progress-label ${
                    i === step ? "" : "estimate-form__progress-label--muted"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="estimate-form__progress-line" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="fp__error" role="alert" style={{ width: "100%", boxSizing: "border-box" }}>
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="estimate-form__card">
          {step === 0 && (
            <>
              <p className="estimate-form__step-title">Step 1 of 3 — Your Device</p>
              <span className="estimate-form__field-label">SELECT BRAND</span>
              <div className="estimate-form__chips">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`estimate-form__chip ${brand === b ? "estimate-form__chip--active" : ""}`}
                    onClick={() => setBrand(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <span className="estimate-form__field-label">DEVICE MODEL</span>
              <input
                className="estimate-form__input"
                placeholder="e.g. iPhone 14 Pro, Galaxy S23"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
              />
              <button
                type="button"
                className="estimate-form__btn-primary"
                disabled={!deviceModel.trim()}
                onClick={next}
              >
                Continue to Issue →
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="estimate-form__step-title">Step 2 of 3 — The Issue</p>
              <span className="estimate-form__field-label">WHAT&apos;S WRONG?</span>
              <div className="estimate-form__chips">
                {ISSUES.map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`estimate-form__chip ${issueType === i ? "estimate-form__chip--active" : ""}`}
                    onClick={() => setIssueType(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="estimate-form__btn-row">
                <button type="button" className="estimate-form__btn-secondary" onClick={back}>
                  ← Back
                </button>
                <button type="button" className="estimate-form__btn-primary" onClick={next}>
                  Continue to Location →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="estimate-form__step-title">Step 3 of 3 — Your Location</p>
              <span className="estimate-form__field-label">CITY</span>
              <input
                className="estimate-form__input"
                placeholder="e.g. Kathmandu"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="estimate-form__btn-row">
                <button type="button" className="estimate-form__btn-secondary" onClick={back}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="estimate-form__btn-primary"
                  disabled={isLoading || !city.trim()}
                  onClick={handleFinish}
                >
                  {isLoading ? "Calculating…" : "See My Estimate →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
