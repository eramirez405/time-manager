import React from 'react';

const TableToggler = React.forwardRef(
  ({ indeterminate, showAllWorkers, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    let FORCE = JSON.parse(localStorage.getItem('showAllWorkers'));

    return (
      <>
        <input
          type='checkbox'
          id='myCheckbox1'
          ref={resolvedRef}
          {...rest}
          style={{ opacity: FORCE && FORCE === true ? '1' : '0' }}
        />
      </>
    );
  }
);

export default TableToggler;
