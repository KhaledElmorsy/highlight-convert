import { render } from 'preact';
import { Conversion } from './Conversion';
import { useEffect, useState } from 'preact/hooks';
import { createElement } from '../util';

function PageConversions({ conversions }) {
  const [renders, setRender] = useState(true);
  useEffect(() => {
    const disable = () => setRender(false);
    document.addEventListener('selectionchange', disable);
    return () => {
      document.removeEventListener('selectionchange', disable);
    };
  }, []);
  return (
    <>
      {renders
        ? conversions.map(
            ({ domRange: range, values, inputValue, renderSettings }) => (
              <Conversion
                key={Date.now()}
                {...{ range, values, inputValue, renderSettings }}
              />
            )
          )
        : null}
    </>
  );
}

const rootID = 'highlight-convert-' + Math.random().toString(36).slice(2);

export default function renderConversions(conversions) {
  const root =
    document.getElementById(rootID) ??
    document.body.appendChild(
      createElement('div', { id: rootID, style: 'display: contents' })
    );

  render(<PageConversions key={Date.now()} conversions={conversions} />, root);
}
