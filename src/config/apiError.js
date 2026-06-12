/**
 * Extracts a human-readable error message from the backend ApiResponse shape:
 * { error: { message: "...", subErrors: ["field: reason", ...] } }
 *
 * If subErrors exist (e.g. validation failures), they're joined into one
 * readable string instead of showing the raw "Input validation failed".
 */
export function extractError(data, fallback = 'Something went wrong. Please try again.') {
  if (!data?.error) return fallback;

  const { message, subErrors } = data.error;

  if (subErrors && subErrors.length > 0) {
    // Turn ["dateOfBirth: must be a past date"] into "Date of birth: must be a past date"
    return subErrors
      .map(e => {
        const colonIdx = e.indexOf(': ');
        if (colonIdx === -1) return e;
        const field = e.slice(0, colonIdx)
          .replace(/([A-Z])/g, ' $1')   // camelCase -> spaces
          .replace(/^./, s => s.toUpperCase()) // capitalise first letter
          .trim();
        const reason = e.slice(colonIdx + 2);
        return `${field}: ${reason}`;
      })
      .join('\n');
  }

  return message || fallback;
}