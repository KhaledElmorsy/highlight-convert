import getStackingContext from "../getStackingContext";

const html = `
<div>
  <div style="position:static; z-index: 3">
    <div style="position:relative; z-index: 5">
      <div style="position:absolute; z-index: 10">
        <div id="target" style="position:relative; z-index: 20">
           Text Node Child
        </div>
      </div>
    </div>
  </div>
</div>
`
/* Position:static in the first child just for JSDOM.*/

let target;
beforeEach(() => {
  document.body.innerHTML = html;
  target = document.getElementById('target');
})

describe.each([
  ['Element', {element: true}],
  ['Non-element', {element: false}],
])('%s node input', (_, {element}) => {
  let input;
  beforeEach(() => {
    input = element? target : target.firstChild;
  })

  it('Returns the correct z-index', () => {
    expect(getStackingContext(input).zIndex).toBe('5');
  })
  
  it('Identifies if in a "fixed" stacking context', () => {
    document.body.firstElementChild.style.position = 'fixed';
    expect(getStackingContext(input).isFixed).toBe(true)
  })
})
