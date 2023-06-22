import { render } from 'preact';
import { Conversion } from './Conversion';
import { useEffect, useState } from 'preact/hooks';
import { createElement } from '../util';
import loadCountryFlagsFont from './util/loadCountryFlagsFont';

loadCountryFlagsFont();

function PageConversions({ conversions }) {
  const [renders, setRender] = useState(true);
  useEffect(() => {
    const disable = () => setRender(false);
    document.addEventListener('selectionchange', disable);
    return () => {
      document.removeEventListener('selectionchange', disable);
    };
  }, []);

  const [hiddenConversions, setHiddenConversions] = useState(new Set());
  function hideConversion(index) {
    setHiddenConversions((set) => new Set([...set, index]));
  }

  return (
    <>
      {renders
        ? conversions.map(
            ({ domRange: range, values, inputValue, renderSettings }, i) =>
              hiddenConversions.has(i) ? null : (
                <Conversion
                  key={i}
                  hide={() => hideConversion(i)}
                  {...{
                    range,
                    values,
                    inputValue,
                    renderSettings,
                  }}
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
