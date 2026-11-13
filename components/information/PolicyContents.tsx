'use client';

import { useEffect, useMemo, useState } from 'react';
import { HookSidebar } from '@/components/ui/hook-sidebar';
import styles from './information.module.css';

export default function PolicyContents({ sections }: { sections: { id: string; number: string; title: string }[] }) {
  const [active, setActive] = useState(0);
  const items = useMemo(() => sections.map(section => ({ label: `${section.number}. ${section.title}`, href: `#${section.id}` })), [sections]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let index = 0;
        sections.forEach((section, i) => { if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= 200) index = i; });
        setActive(index);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); };
  }, [sections]);
  return <details className={styles.contents}><summary>On this page</summary><HookSidebar items={items} value={active} onChange={setActive} dashed={false} aria-label="Policy contents" /></details>;
}
