import React from 'react';

const Table = ({ headers, data, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-2xl border ${className}`} style={{ borderColor: 'var(--color-border)' }}>
      <table className="min-w-full" style={{ background: 'var(--color-surface)' }}>
        <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors hover:bg-white/[0.03]">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
