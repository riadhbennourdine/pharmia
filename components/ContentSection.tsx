
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Section, GlossaryTerm } from '../types';
import { ChevronRightIcon } from './icons';

interface HighlightedTextProps {
    text: string;
    terms: GlossaryTerm[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, terms }) => {
    if (!terms || terms.length === 0) {
        return <>{text}</>;
    }
    const termRegex = new RegExp(`\\b(${terms.map(t => t.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    
    // Check if there are any terms to highlight to avoid unnecessary processing
    if (!termRegex.test(text)) {
        return <>{text}</>;
    }
    
    const parts = text.split(termRegex);

    return (
        <>
            {parts.map((part, i) => {
                const matchingTerm = terms.find(t => t.term.toLowerCase() === part.toLowerCase());
                if (matchingTerm) {
                    return (
                        <span key={i} className="relative group cursor-pointer font-semibold text-green-700 underline decoration-green-300 decoration-2 underline-offset-2">
                            {part}
                            <span className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none transform -translate-x-1/2 left-1/2">
                                <strong className="font-bold block mb-1">{matchingTerm.term}</strong>
                                {matchingTerm.definition}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </span>
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};

const renderWithHighlighting = (children: React.ReactNode, terms: GlossaryTerm[]): React.ReactNode => {
    return React.Children.map(children, child => {
        if (typeof child === 'string') {
            return <HighlightedText text={child} terms={terms} />;
        }
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            // Avoid highlighting inside code blocks or other special elements
            if (child.type === 'code' || child.type === 'pre') {
                return child;
            }
            return React.cloneElement(child, {
                ...child.props,
                children: renderWithHighlighting(child.props.children, terms),
            });
        }
        return child;
    });
};

interface ContentSectionProps {
    sections: Section[];
    glossaryTerms: GlossaryTerm[];
    level?: number;
}

const ContentSection: React.FC<ContentSectionProps> = ({ sections, glossaryTerms, level = 0 }) => {
    const [openSectionId, setOpenSectionId] = useState<string | null>(sections && sections.length > 0 ? sections[0].id : null);

    useEffect(() => {
        // Automatically open the first section on initial render if it's not already open
        if (sections && sections.length > 0 && !openSectionId) {
            setOpenSectionId(sections[0].id);
        }
    }, [sections, openSectionId]);

    if (!sections || sections.length === 0) {
        return <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">Aucun contenu détaillé disponible pour cette fiche.</div>;
    }

    const handleToggle = (id: string) => {
        setOpenSectionId(currentOpenId => (currentOpenId === id ? null : id));
    };

    const customRenderers = {
        p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 leading-relaxed">{renderWithHighlighting(children, glossaryTerms)}</p>,
        li: ({ children }: { children?: React.ReactNode }) => <li className="mb-2">{renderWithHighlighting(children, glossaryTerms)}</li>,
        ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-4 pl-4">{children}</ul>,
        ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-4 pl-4">{children}</ol>,
        strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-gray-800">{renderWithHighlighting(children, glossaryTerms)}</strong>,
        h1: () => null, h2: () => null, h3: () => null, h4: () => null, // Titles are handled by the button
    };

    return (
        <div className="space-y-3">
            {sections.map((section) => {
                const isOpen = openSectionId === section.id;
                return (
                    <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ marginLeft: `${level * 20}px` }}>
                        <button 
                            onClick={() => handleToggle(section.id)}
                            className="w-full flex items-center gap-3 p-4 font-semibold text-lg text-left cursor-pointer hover:bg-slate-50 transition-colors"
                            aria-expanded={isOpen}
                            aria-controls={`section-content-${section.id}`}
                        >
                            <ChevronRightIcon className={`w-5 h-5 text-green-600 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
                            <span>{section.title}</span>
                        </button>
                        {isOpen && (
                            <div id={`section-content-${section.id}`} className="p-4 pt-0 border-t border-gray-200 prose max-w-none">
                                <ReactMarkdown
                                    components={customRenderers}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {section.content}
                                </ReactMarkdown>
                                {section.children && section.children.length > 0 && (
                                    <div className="mt-4">
                                        <ContentSection sections={section.children} glossaryTerms={glossaryTerms} level={level + 1} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ContentSection;
