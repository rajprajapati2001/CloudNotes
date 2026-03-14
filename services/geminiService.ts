const tidyWhitespace = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const sentenceCase = (line: string): string => {
  const cleaned = line.trim();
  if (!cleaned) return '';

  return cleaned
    .split(/([.!?]\s+)/)
    .map(part => {
      if (!part || /^[.!?]\s*$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};

const normalizeBullet = (line: string): string => {
  const bulletMatch = line.match(/^\s*[-*•]\s*(.+)$/);
  if (!bulletMatch) return sentenceCase(line);

  const bulletContent = sentenceCase(bulletMatch[1]);
  return `- ${bulletContent}`;
};

const enhanceLocally = (content: string): string => {
  const normalized = tidyWhitespace(content);
  if (!normalized) return content;

  const lines = normalized.split('\n').map(line => line.trimEnd());

  const enhancedLines = lines.map(line => {
    if (!line.trim()) return '';
    return normalizeBullet(line);
  });

  return enhancedLines.join('\n').trim();
};

export const enhanceNoteContent = async (content: string): Promise<string> => {
  // Fully free enhancement: runs locally in-browser with no paid API.
  return Promise.resolve(enhanceLocally(content));
};
