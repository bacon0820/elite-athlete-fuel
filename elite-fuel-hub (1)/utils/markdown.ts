
export function parseMarkdown(text: string): string {
  if (!text) return "";
  
  let html = text;

  // Cleanup potential raw markdown quirks (like ##** artifacts)
  html = html.replace(/#{2,}\**\s*/g, '### ');
  html = html.replace(/\*\*#{2,}/g, '### ');
  html = html.trim();

  // Headers
  html = html.replace(/^###+?\s*(.*$)/gim, '<h3 class="text-lg font-black mt-4 mb-2 text-slate-900 uppercase tracking-tight">$1</h3>');
  html = html.replace(/^##\s*(.*$)/gim, '<h2 class="text-xl font-black mt-6 mb-3 text-slate-900 uppercase tracking-tight">$1</h2>');
  html = html.replace(/^#\s*(.*$)/gim, '<h1 class="text-2xl font-black mt-8 mb-4 text-slate-900 uppercase tracking-tight">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-black text-slate-900">$1</strong>');

  // Lists - specially handled for exercises in TrainingPlans
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-600 font-medium mb-1">$1</li>');
  
  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul class="my-2">$1</ul>');
  html = html.replace(/<\/ul>\s*<ul class="my-2">/gim, '');

  // Clean up remaining DAY markers
  html = html.replace(/---DAY_START---/g, '');
  html = html.replace(/---DAY_END---/g, '');

  // Line breaks
  html = html.replace(/\n/gim, '<br />');

  // Specifically for the Training Hub, we want to split the exercise parts
  // Format: - **Exercise Name** | Sets x Reps | Rest | RPE
  // This turns the pipe segments into styled spans if they are inside an <li>
  // html = html.replace(/\|/g, '<span class="mx-2 text-slate-500 opacity-40">/</span>');

  return html;
}
