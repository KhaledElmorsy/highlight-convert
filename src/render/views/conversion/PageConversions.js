import { render } from 'preact';
import { Conversion } from './Conversion';
import { useEffect, useState } from 'preact/hooks';

function PageConversions({ conversions }) {
  const [renders, setRender] = useState(true);
  useEffect(() => {
    const disable = () => render(null, document.body)
    document.addEventListener('selectionchange', disable);
    return () => {
      document.removeEventListener('selectionchange', disable);
    };
  }, []);
  return (
    <>
      {renders
        ? conversions.map(({ range, conversion }, cIndex) => (
            <Conversion key={Date.now()} {...{ range, conversion }} />
          ))
        : null}
    </>
  );
}

export default function renderConversions(conversions) {
  render(<PageConversions key={Date.now()} conversions={conversions} />, document.body);
}
