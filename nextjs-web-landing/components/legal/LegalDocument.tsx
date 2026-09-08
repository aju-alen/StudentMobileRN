import type { LegalBlock, LegalSection } from '@/lib/legal/types';

function renderBlock(block: LegalBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          key={index}
          className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4 last:mb-0"
        >
          {block.text}
        </p>
      );
    case 'bullets':
      return (
        <ul
          key={index}
          className="list-disc ps-6 space-y-2 mb-4 text-gray-700 text-base sm:text-lg leading-relaxed"
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div
          key={index}
          className="overflow-x-auto mb-6 rounded-lg border border-gray-200"
        >
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {block.rows.map((row) => (
                <tr key={row.join('-')}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cell}-${cellIndex}`}
                      className="px-4 py-3 text-gray-700 align-top"
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
    default:
      return null;
  }
}

function renderBlocks(blocks: LegalBlock[]) {
  return blocks.map((block, index) => renderBlock(block, index));
}

type LegalDocumentProps = {
  sections: LegalSection[];
};

export default function LegalDocument({ sections }: LegalDocumentProps) {
  return (
    <div className="space-y-10 sm:space-y-12">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">
            {section.title}
          </h2>

          {section.blocks.length > 0 && (
            <div>{renderBlocks(section.blocks)}</div>
          )}

          {section.subsections?.map((subsection) => (
            <div key={subsection.id} id={subsection.id} className="mt-6">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">
                {subsection.title}
              </h3>
              {renderBlocks(subsection.blocks)}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
