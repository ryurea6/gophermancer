/**
 * Gopher wire protocol codec
 * Handles encoding requests and decoding responses with proper CRLF handling
 */

const CRLF = '\r\n';

/**
 * Encode a Gopher request selector with CRLF line ending
 * @param {string} selector - The selector string to send (may be empty)
 * @returns {string} - The selector followed by CRLF
 */
export function encodeRequest(selector) {
  return selector + CRLF;
}

/**
 * Decode a buffer into lines, accepting both CRLF and LF line endings
 * @param {Buffer} buffer - Raw bytes from the Gopher server
 * @returns {string[]} - Array of lines (without line endings)
 */
export function decodeLines(buffer) {
  const text = buffer.toString('utf8');
  // Split by CRLF or LF for robustness
  return text.split(/\r?\n/);
}
