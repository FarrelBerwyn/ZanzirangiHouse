import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (url: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (onNavigate && url.startsWith('/')) {
      e.preventDefault();
      onNavigate(url);
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://zanzirangihouse.com${item.url}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-0">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#8E8B85]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.url} className="flex items-center space-x-1.5">
                {index === 0 ? (
                  <a
                    href={item.url}
                    onClick={(e) => handleClick(e, item.url)}
                    className="flex items-center space-x-1 text-[#8E8B85] hover:text-[#C4A27A] transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </a>
                ) : isLast ? (
                  <span className="text-[#C4A27A] font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a
                    href={item.url}
                    onClick={(e) => handleClick(e, item.url)}
                    className="text-[#8E8B85] hover:text-[#C4A27A] transition-colors"
                  >
                    {item.name}
                  </a>
                )}
                {!isLast && <ChevronRight className="w-3 h-3 text-[#A8A49C]/60" />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
