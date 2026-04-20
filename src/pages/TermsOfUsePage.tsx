import { useState, useEffect } from 'react';
import { ShieldCheck, FileText, HelpCircle, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { MOCK_PAGES } from '../mockData';

export default function TermsOfUsePage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const pageData = MOCK_PAGES.terms;
        if (pageData) {
          setContent(pageData.content);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Termos de Uso</h1>
        <p className="text-gray-500 mt-2 font-medium">Leia atentamente as regras da nossa plataforma.</p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <div className="markdown-body prose prose-green max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
