// Utility functions for formatting data

// Format a date string to a readable format
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Render HTML content safely
export const renderHtmlContent = (content: string) => {
  // Function to convert the content to HTML safely
  // If the content contains HTML tags (like videos), don't modify them
  if (content.includes('<video') || content.includes('<img')) {
    return { __html: content };
  }
  
  // Otherwise, convert line breaks to paragraphs
  return {
    __html: content
      .split('\n')
      .filter(paragraph => paragraph.trim() !== '')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('')
  };
};
