import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    // Small shared hook so every page sets its title the same way.
    document.title = title;
  }, [title]);
}
