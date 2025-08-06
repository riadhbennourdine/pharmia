
import React from 'react';
import { GlossaryTerm } from '../types';

interface GlossaryListProps {
  terms: GlossaryTerm[];
}

const GlossaryList: React.FC<GlossaryListProps> = ({ terms }) => {
    
  if (!terms || terms.length === 0) {
      return <p>Pas de termes de glossaire disponibles.</p>;
  }
    
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Glossaire</h3>
      <div className="space-y-4">
        {terms.map((term, index) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-gray-200">
            <dt className="font-semibold text-green-700">{term.term}</dt>
            <dd className="mt-1 text-gray-600">{term.definition}</dd>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryList;