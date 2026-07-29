"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQ_ENTRIES, FAQ_TOPICS, type FaqTopic } from "@/features/support/data/faq";

/**
 * Help Center — feature UI only.
 *
 * Static content by design: these are documentation, not data. Answers are
 * filterable by topic and searchable, so the user recognises the right
 * question rather than recalling where it lives (Recognition over Recall).
 */
export default function HelpCenter() {
  const [topic, setTopic] = useState<FaqTopic | "All">("All");
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const normalised = query.trim().toLowerCase();
  const entries = FAQ_ENTRIES.filter((entry) => {
    const matchesTopic = topic === "All" || entry.topic === topic;
    const matchesQuery =
      !normalised ||
      entry.question.toLowerCase().includes(normalised) ||
      entry.answer.toLowerCase().includes(normalised);
    return matchesTopic && matchesQuery;
  });

  return (
    <section className="help" aria-labelledby="help-heading">
      <div className="help__hero">
        <h1 id="help-heading" className="plist__title">
          How can we help?
        </h1>
        <p className="plist__subtitle">
          Answers to the questions we get most about repairs, orders and payments.
        </p>

        <input
          className="plist__search-input help__search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          aria-label="Search help articles"
        />
      </div>

      <div className="help__topics" role="tablist" aria-label="Help topics">
        <button
          type="button"
          role="tab"
          aria-selected={topic === "All"}
          className={`dash__tab ${topic === "All" ? "dash__tab--active" : ""}`}
          onClick={() => setTopic("All")}
        >
          All
        </button>
        {FAQ_TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={topic === t}
            className={`dash__tab ${topic === t ? "dash__tab--active" : ""}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="dash__empty">
          No articles match that search. Try a different word, or contact support below.
        </p>
      ) : (
        <div className="help__list">
          {entries.map((entry) => {
            const isOpen = openQuestion === entry.question;
            return (
              <div className="help__item" key={entry.question}>
                <button
                  type="button"
                  className="help__question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? null : entry.question)}
                >
                  <span>{entry.question}</span>
                  <span className="help__chevron" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && <p className="help__answer">{entry.answer}</p>}
              </div>
            );
          })}
        </div>
      )}

      <div className="bdetail__panel help__contact">
        <h2 className="bdetail__panel-title">Still need help?</h2>
        <p className="lform__hint">
          Live chat and ticket escalation are planned for a future release. In the meantime,
          reach us by email and we&apos;ll respond within one business day.
        </p>
        <div className="help__contact-tiles">
          <a href="mailto:support@techfix.example" className="help__tile">
            <span className="help__tile-label">Email</span>
            <span className="help__tile-value">support@techfix.example</span>
          </a>
          <div className="help__tile">
            <span className="help__tile-label">Phone</span>
            <span className="help__tile-value">+977-1-4000000</span>
          </div>
          <Link href="/my-repairs" className="help__tile">
            <span className="help__tile-label">Repair delayed?</span>
            <span className="help__tile-value">Check your repair status →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
