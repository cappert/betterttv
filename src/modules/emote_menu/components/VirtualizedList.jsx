import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from '../styles/list.module.css';

function VirtualizedList(
  {className, totalRows, rowHeight, renderRow, windowHeight, stickyRows = [], onHeaderChange = () => {}},
  ref
) {
  const listHeight = useMemo(() => rowHeight * totalRows, [totalRows, rowHeight]);

  const [data, setData] = useState({
    top: 0,
    rows: [],
    headerIndex: null,
  });

  useEffect(() => onHeaderChange(data.headerIndex), [data.headerIndex]);

  const wrapperRef = ref || useRef(null);

  const isInViewport = useCallback(() => {
    const {scrollTop} = wrapperRef.current;
    const scrollBottom = scrollTop + windowHeight;

    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(totalRows - 1, Math.floor(scrollBottom / rowHeight));

    let stickyRowIndex;
    for (const rowIndex of stickyRows) {
      if (rowIndex > startIndex) {
        break;
      }
      stickyRowIndex = rowIndex;
    }

    const rowsVisible = [];
    const hasAdditionalStickyRow = stickyRowIndex < startIndex;
    if (hasAdditionalStickyRow) {
      rowsVisible.push(stickyRowIndex);
    }

    for (let i = startIndex; i <= endIndex; i++) {
      rowsVisible.push(i);
    }

    const indexOffset = hasAdditionalStickyRow ? startIndex - 1 : startIndex;
    setData({
      rows: rowsVisible,
      top: indexOffset * rowHeight,
      headerIndex: stickyRowIndex,
    });
  }, [totalRows, rowHeight, windowHeight, stickyRows]);

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', isInViewport);
    isInViewport();
    return () => {
      if (wrapperRef.current == null) {
        return;
      }
      wrapperRef.current.removeEventListener('scroll', isInViewport);
    };
  }, [isInViewport]);

  const rows = useMemo(
    () =>
      data.rows.map((value) =>
        renderRow({
          key: `row-${value}`,
          index: value,
          style: {
            height: `${rowHeight}px`,
          },
          className: styles.row,
        })
      ),
    [data.rows, renderRow]
  );

  return (
    <div className={classNames(styles.list, className)} style={{height: windowHeight}} ref={wrapperRef}>
      <div className={styles.rows} style={{top: data.top}}>
        {rows}
      </div>
      <div className={styles.ghostRows} style={{height: listHeight}} />
    </div>
  );
}

export default React.forwardRef(VirtualizedList);
