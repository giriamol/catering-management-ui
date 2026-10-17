import React, { useId, useRef } from "react";
import "./DatePicker.css";

/**
 * Reusable application-wide date picker.
 *
 * value:     ISO date string, "YYYY-MM-DD", or empty string
 * onChange:  receives the selected ISO date string, e.g. "2026-10-12"
 *
 * Example:
 * <DatePicker
 *   label="Effective From"
 *   value={form.effectiveFrom}
 *   onChange={(date) => setForm((prev) => ({ ...prev, effectiveFrom: date }))}
 *   required
 * />
 */

const toISODate = (value) => {
    if (!value) return "";

    const text = String(value).trim();

    // API value such as YYYY-MM-DD or an ISO datetime.
    const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    // Also accept DD/MM/YYYY values from existing APIs/forms.
    const displayMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (displayMatch) {
        return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
    }

    return "";
};

const formatDate = (value) => {
    const iso = toISODate(value);
    if (!iso) return "";

    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return "";

    return `${match[3]}/${match[2]}/${match[1]}`;
};

const DatePicker = ({
    id,
    name,
    label,
    value = "",
    onChange,
    required = false,
    disabled = false,
    min,
    max,
    placeholder = "DD/MM/YYYY",
    className = "",
    error = ""
}) => {
    const inputRef = useRef(null);
    const generatedId = useId();
    const inputId = id || name || `date-picker-${generatedId}`;
    const isoValue = toISODate(value);

    const openPicker = () => {
        if (disabled) return;

        const input = inputRef.current;
        if (!input) return;

        try {
            if (typeof input.showPicker === "function") {
                input.showPicker();
            } else {
                input.focus();
                input.click();
            }
        } catch {
            input.focus();
            input.click();
        }
    };

    const handleDateChange = (event) => {
        onChange?.(event.target.value);
    };

    return (
        <div className={`common-date-picker ${className}`.trim()}>
            {label && (
                <label className="common-date-picker-label" htmlFor={`${inputId}-display`}>
                    {label}
                    {required && <span className="common-date-picker-required"> *</span>}
                </label>
            )}

            <div className={`common-date-picker-control${disabled ? " is-disabled" : ""}${error ? " has-error" : ""}`}>
                <input
                    id={`${inputId}-display`}
                    className="common-date-picker-display"
                    type="text"
                    value={formatDate(isoValue)}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                    onClick={openPicker}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openPicker();
                        }
                    }}
                    aria-label={label || placeholder}
                    aria-haspopup="dialog"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />

                <button
                    type="button"
                    className="common-date-picker-button"
                    onClick={openPicker}
                    disabled={disabled}
                    aria-label={label ? `Choose ${label} date` : "Choose date"}
                    tabIndex={-1}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 10h18" />
                    </svg>
                </button>

                <input
                    ref={inputRef}
                    className="common-date-picker-native"
                    type="date"
                    name={name}
                    value={isoValue}
                    min={min ? toISODate(min) : undefined}
                    max={max ? toISODate(max) : undefined}
                    required={required}
                    disabled={disabled}
                    onChange={handleDateChange}
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>

            {error && (
                <span className="common-date-picker-error" id={`${inputId}-error`}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default DatePicker;
