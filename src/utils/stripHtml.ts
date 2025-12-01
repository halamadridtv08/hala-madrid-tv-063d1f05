/**
 * Removes HTML tags from a string and returns plain text
 * Useful for displaying content that contains HTML formatting as plain text
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary element to parse HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};
